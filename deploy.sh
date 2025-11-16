#!/bin/bash

# Default message if none provided
MESSAGE="default message"

# Parse arguments for -m
while [ $# -gt 0 ]; do
  case "$1" in
    -m)
      shift
      MESSAGE="$1"
      ;;
    *)
      ;;
  esac
  shift
done

# Run the wrangler command with the parsed message
npx wrangler pages deploy out --project-name=next-js-test --branch=main --commit-message="$MESSAGE"
