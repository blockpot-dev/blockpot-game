#!/bin/bash

# Sync ABIs from one or more contract repos into src/abi/.
#
# Each contract repo is expected to expose a `cli/` subdir with a Cargo binary whose
# `export-abi` subcommand reads `cli/abis.toml` and writes TypeScript files.
#
# Usage: ./sync-abis.sh <contracts_dir> [<more_dirs...>] <output_path>
# Example: ./sync-abis.sh ../unipot-contracts ../blockpot-contracts src/abi

set -e

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <contracts_dir> [<more_dirs>...] <output_path>"
    exit 1
fi

# Last arg is the output path; everything before is a contract source tree.
OUTPUT_PATH=$(pwd)/${@: -1}
DIRS=("${@:1:$#-1}")

for DIR in "${DIRS[@]}"; do
    echo "Syncing from $DIR..."
    pushd "$DIR" > /dev/null
    if [ -z "$SKIP_TESTS" ]; then
        forge test > /dev/null || (echo "Tests failed in $DIR! (set SKIP_TESTS=1 to bypass)" && exit 1)
    else
        echo "  (SKIP_TESTS=1 — skipping forge test)"
    fi
    pushd cli > /dev/null

    # Binary name is read from cli/Cargo.toml; we expect exactly one [[bin]] per repo.
    BIN_NAME=$(grep -E '^name\s*=' Cargo.toml | head -n 2 | tail -n 1 | sed -E 's/.*"([^"]+)".*/\1/')
    if [ -z "$BIN_NAME" ]; then
        echo "Could not determine binary name from $DIR/cli/Cargo.toml"
        exit 1
    fi

    cargo run --bin "$BIN_NAME" -- export-abi --config abis.toml --output "$OUTPUT_PATH"
    popd > /dev/null
    popd > /dev/null
done

echo "Linting ABIs..."
npx eslint --fix src/abi/**/*.ts
echo "Done!"
