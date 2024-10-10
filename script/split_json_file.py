import json
import os
import math


def split_json_into_chunks(input_file, output_dir, num_chunks):
    # Read the input JSON file
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Get the keys of the dictionary
    keys = list(data.keys())
    total_items = len(keys)
    chunk_size = math.ceil(total_items / num_chunks)

    # Split the data into chunks and write to separate files
    for i in range(num_chunks):
        start_index = i * chunk_size
        end_index = min((i + 1) * chunk_size, total_items)
        chunk_keys = keys[start_index:end_index]

        chunk_data = {k: data[k] for k in chunk_keys}

        output_file = os.path.join(output_dir, f'chunk_{i + 1}.json')
        with open(output_file, 'w') as f:
            json.dump(chunk_data, f, separators=(',', ':'))

    print(f"Split {input_file} into {num_chunks} chunks in {output_dir}")


# Example usage
input_file = 'games.json'
output_dir = 'd3-ts-website/src/data'
num_chunks = 10

split_json_into_chunks(input_file, output_dir, num_chunks)