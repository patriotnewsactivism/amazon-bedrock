"""
Bedrock CLI: unified text generation over Bedrock Converse API.

Usage:
  python /app/bedrock_cli.py --model-id anthropic.claude-3-5-sonnet-20241022-v2:0 --prompt "Say hi" --region us-east-1
  python /app/bedrock_cli.py --model-id meta.llama3-70b-instruct-v1:0 --prompt "Explain DNS." --region us-west-2 --max-tokens 400
  python /app/bedrock_cli.py --model-id anthropic.claude-3-5-sonnet-20241022-v2:0 --prompt "Stream this reply." --stream
  python /app/bedrock_cli.py --doctor  # quick environment checks

WHY these choices:
- Uses Converse/ConverseStream so one codepath works across providers.
- Prints clear, actionable errors instead of stack noise.
"""

from __future__ import annotations

import argparse
import sys
import time
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError


def build_runtime(region: Optional[str]) -> Any:
    """Create a Bedrock runtime client for the provided region."""

    if region:
        return boto3.client("bedrock-runtime", region_name=region)
    return boto3.client("bedrock-runtime")


def _format_messages(prompt: str) -> List[Dict[str, Any]]:
    """Convert the user prompt into Bedrock Converse message format."""

    return [{"role": "user", "content": [{"text": prompt}]}]


def call_converse(
    client: Any,
    model_id: str,
    prompt: str,
    max_tokens: int,
    temperature: float,
    top_p: float,
) -> str:
    """Invoke the Converse API and return the aggregated text response."""

    try:
        resp = client.converse(
            modelId=model_id,
            messages=_format_messages(prompt),
            inferenceConfig={
                "maxTokens": max_tokens,
                "temperature": temperature,
                "topP": top_p,
            },
        )
        parts = resp.get("output", {}).get("message", {}).get("content", [])
        text_chunks = [p.get("text", "") for p in parts if "text" in p]
        return "".join(text_chunks).strip()
    except ClientError as e:
        _raise_pretty_bedrock_error(e, model_id)
    except BotoCoreError as e:
        raise SystemExit(f"[Bedrock/Boto] {e}")


def call_converse_stream(
    client: Any,
    model_id: str,
    prompt: str,
    max_tokens: int,
    temperature: float,
    top_p: float,
) -> None:
    """Stream the Converse API response to stdout as chunks arrive."""

    try:
        stream = client.converse_stream(
            modelId=model_id,
            messages=_format_messages(prompt),
            inferenceConfig={
                "maxTokens": max_tokens,
                "temperature": temperature,
                "topP": top_p,
            },
        )
        with stream as s:
            for event in s["stream"]:
                if "messageStart" in event:
                    continue
                if "contentBlockStart" in event:
                    continue
                if "contentBlockDelta" in event:
                    delta = event["contentBlockDelta"]["delta"]
                    text = delta.get("text")
                    if text:
                        print(text, end="", flush=True)
                if "contentBlockStop" in event:
                    continue
                if "messageStop" in event:
                    break
                if "metadata" in event:
                    continue
        print()
    except ClientError as e:
        _raise_pretty_bedrock_error(e, model_id)
    except BotoCoreError as e:
        raise SystemExit(f"[Bedrock/Boto] {e}")


def _raise_pretty_bedrock_error(err: ClientError, model_id: str) -> None:
    """Re-raise a Bedrock client error with actionable guidance."""

    code = err.response.get("Error", {}).get("Code", "Unknown")
    msg = err.response.get("Error", {}).get("Message", str(err))
    hints = []
    if code in {"AccessDeniedException", "ForbiddenException"}:
        hints.append(
            "Check IAM: allow bedrock:InvokeModel and bedrock:InvokeModelWithResponseStream on the model ARN."
        )
    if code in {"ValidationException", "BadRequestException"}:
        hints.append(
            "Request shape likely wrong for this provider, or bad modelId. Using Converse avoids provider-specific schemas."
        )
    if "model not enabled" in msg.lower():
        hints.append("Enable the foundation model in the Bedrock console for this region/account.")
    if "Unrecognized model" in msg or "modelId" in msg:
        hints.append(f"Verify modelId '{model_id}' and region; models are region-scoped.")
    if code in {"ThrottlingException", "TooManyRequestsException"}:
        hints.append("You're throttled. Add retries/backoff or lower token limits.")
    if "tokens" in msg.lower() and "max" in msg.lower():
        hints.append("Reduce maxTokens or input size; watch provider token limits.")
    hint_blob = ("\nHints:\n- " + "\n- ".join(hints)) if hints else ""
    raise SystemExit(f"[Bedrock] {code}: {msg}{hint_blob}")


def doctor(region: Optional[str]) -> int:
    """Run connectivity and credential checks for Bedrock usage."""

    print("Bedrock Doctor\n--------------")
    try:
        sts = boto3.client("sts", region_name=region) if region else boto3.client("sts")
        ident = sts.get_caller_identity()
        print(f"AWS identity ok: {ident.get('Account')} / {ident.get('Arn')}")
    except Exception as e:  # pragma: no cover - best effort diagnostic
        print(f"STS check failed: {e}")
        return 2

    try:
        rt = build_runtime(region)
        print("Runtime client constructed.")
    except Exception as e:  # pragma: no cover - best effort diagnostic
        print(f"Runtime init failed: {e}")
        return 2

    import os

    model_id = os.getenv("BEDROCK_MODEL_ID")
    if model_id:
        try:
            t0 = time.time()
            out = call_converse(rt, model_id, "Respond with the word OK.", 5, 0.0, 1.0)
            dt = (time.time() - t0) * 1000
            print(f"Smoke test ok ({int(dt)} ms): {out!r}")
        except SystemExit as e:
            print(f"Smoke test failed: {e}")
            return 3
    else:
        print("Set BEDROCK_MODEL_ID to run a one-token smoke test.")

    print("Doctor finished: looks good.")
    return 0


def parse_args(argv: List[str]) -> argparse.Namespace:
    """Parse command-line arguments for the CLI."""

    p = argparse.ArgumentParser(description="AWS Bedrock Converse CLI")
    p.add_argument("--model-id", help="e.g., anthropic.claude-3-5-sonnet-20241022-v2:0", required=False)
    p.add_argument("--prompt", help="User prompt text", required=False)
    p.add_argument("--region", help="AWS region, e.g., us-east-1", required=False)
    p.add_argument("--max-tokens", type=int, default=512)
    p.add_argument("--temperature", type=float, default=0.2)
    p.add_argument("--top-p", type=float, default=0.9)
    p.add_argument("--stream", action="store_true", help="Use streaming output")
    p.add_argument("--doctor", action="store_true", help="Run environment checks")
    args = p.parse_args(argv)

    if not args.doctor:
        missing = [name for name, val in (("model-id", args.model_id), ("prompt", args.prompt)) if not val]
        if missing:
            p.error(f"Missing required: {', '.join(missing)} (or use --doctor)")

    return args


def main(argv: List[str]) -> None:
    """Entry point for the CLI script."""

    args = parse_args(argv)
    if args.doctor:
        sys.exit(doctor(args.region))

    client = build_runtime(args.region)

    if args.stream:
        call_converse_stream(
            client=client,
            model_id=args.model_id,
            prompt=args.prompt,
            max_tokens=args.max_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
        )
    else:
        text = call_converse(
            client=client,
            model_id=args.model_id,
            prompt=args.prompt,
            max_tokens=args.max_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
        )
        print(text)


if __name__ == "__main__":
    main(sys.argv[1:])

