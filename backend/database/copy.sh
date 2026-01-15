#!/bin/bash

# Script to copy file contents to clipboard with filenames as headers
# Usage: ./script.sh [file1 file2 ...] or ./script.sh (for all files in current directory)

# Detect clipboard command based on OS
if command -v xclip &> /dev/null; then
    CLIP_CMD="xclip -selection clipboard"
elif command -v xsel &> /dev/null; then
    CLIP_CMD="xsel --clipboard --input"
elif command -v pbcopy &> /dev/null; then
    CLIP_CMD="pbcopy"
elif command -v clip.exe &> /dev/null; then
    CLIP_CMD="clip.exe"
else
    echo "Error: No clipboard utility found. Please install xclip, xsel, or pbcopy."
    exit 1
fi

# Temporary file to store combined content
TEMP_FILE=$(mktemp)

# Function to add file content with header
add_file_content() {
    local file="$1"
    
    # Skip directories
    if [[ -d "$file" ]]; then
        return
    fi
    
    # Check if file is readable
    if [[ ! -r "$file" ]]; then
        echo "Warning: Cannot read file '$file', skipping..." >&2
        return
    fi
    
    # Add filename header
    echo "=== $file ===" >> "$TEMP_FILE"
    
    # Add file content
    cat "$file" >> "$TEMP_FILE"
    
    # Add separator
    echo -e "\n" >> "$TEMP_FILE"
}

# Main logic
if [[ $# -eq 0 ]]; then
    # No arguments: process all files in current directory
    echo "Processing all files in current directory..."
    
    for file in *; do
        # Skip the script itself and directories
        if [[ -f "$file" && "$file" != "$(basename "$0")" ]]; then
            add_file_content "$file"
        fi
    done
else
    # Process specified files
    for file in "$@"; do
        if [[ ! -e "$file" ]]; then
            echo "Warning: File '$file' does not exist, skipping..." >&2
            continue
        fi
        add_file_content "$file"
    done
fi

# Copy to clipboard
if [[ -s "$TEMP_FILE" ]]; then
    cat "$TEMP_FILE" | eval "$CLIP_CMD"
    echo "✓ File contents copied to clipboard!"
    
    # Show summary
    file_count=$(grep -c "^===" "$TEMP_FILE")
    echo "  Files processed: $file_count"
else
    echo "Error: No content to copy."
    rm "$TEMP_FILE"
    exit 1
fi

# Clean up
rm "$TEMP_FILE"
