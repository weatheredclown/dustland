#!/bin/bash
set -e

# Check if a path is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_comfyui>"
  exit 1
fi

COMFYUI_PATH="$1"
CUSTOM_NODES_PATH="$COMFYUI_PATH/custom_nodes"

# Check if the provided path is a directory
if [ ! -d "$COMFYUI_PATH" ]; then
  echo "Error: '$COMFYUI_PATH' is not a directory."
  exit 1
fi

# Check if the custom_nodes directory exists
if [ ! -d "$CUSTOM_NODES_PATH" ]; then
  echo "Error: '$CUSTOM_NODES_PATH' not found. Please ensure you have a valid ComfyUI installation."
  exit 1
fi

# This script's directory, regardless of where it's called from
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Path to the nodes to be copied, relative to this script's location
NODES_SOURCE_PATH="$SCRIPT_DIR/../custom_nodes"

# Copy the directories
echo "Copying dustland_game_assets..."
cp -r "$NODES_SOURCE_PATH/dustland_game_assets" "$CUSTOM_NODES_PATH/"

echo "Copying dustland_skin_batch..."
cp -r "$NODES_SOURCE_PATH/dustland_skin_batch" "$CUSTOM_NODES_PATH/"

echo "Installation complete."
echo "Copied 'dustland_game_assets' and 'dustland_skin_batch' to '$CUSTOM_NODES_PATH'."
echo "Please restart ComfyUI to see the new nodes."
