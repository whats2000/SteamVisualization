"""
Script to analyze and merge Steam game datasets
Analyzes the structure of both old (JSON) and new (CSV) data,
then merges them by app ID and splits into chunks for progressive loading.
"""

import json
import csv
import ast
import os
from collections import defaultdict
from pathlib import Path

# Paths (relative to project root)
PROJECT_ROOT = Path(__file__).parent.parent
OLD_DATA_DIR = PROJECT_ROOT / "d3-ts-website" / "src" / "data"
NEW_DATA_FILE = PROJECT_ROOT / "raw_data" / "games_march2025_cleaned.csv"
OUTPUT_DIR = PROJECT_ROOT / "d3-ts-website" / "src" / "data"
NUM_CHUNKS = 20

def analyze_csv_structure(csv_file, num_samples=3):
    """Analyze the structure of the new CSV data"""
    print("=" * 80)
    print("ANALYZING NEW CSV DATA STRUCTURE")
    print("=" * 80)
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        
        print(f"\nTotal columns: {len(headers)}")
        print("\nColumn names:")
        for i, header in enumerate(headers, 1):
            print(f"  {i:2d}. {header}")
        
        print(f"\n\nSample rows (first {num_samples}):")
        print("-" * 80)
        
        for i, row in enumerate(reader):
            if i >= num_samples:
                break
            print(f"\nRow {i+1} - App ID: {row['appid']}, Name: {row['name']}")
            for key, value in row.items():
                if value and len(str(value)) > 100:
                    print(f"  {key}: {str(value)[:100]}...")
                else:
                    print(f"  {key}: {value}")
            print("-" * 80)
    
    return headers

def analyze_json_structure(json_dir):
    """Analyze the structure of old JSON data"""
    print("\n" + "=" * 80)
    print("ANALYZING OLD JSON DATA STRUCTURE")
    print("=" * 80)
    
    # Read from chunk_1.json (chunk_0 is empty)
    json_file = os.path.join(json_dir, "chunk_1.json")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"\nTotal games in chunk_1: {len(data)}")
    
    # Get first game
    first_key = list(data.keys())[0]
    first_game = data[first_key]
    
    print(f"\nSample game structure (App ID: {first_key}):")
    print(f"Game name: {first_game.get('name', 'N/A')}")
    print("\nFields in old JSON structure:")
    for i, (key, value) in enumerate(first_game.items(), 1):
        value_type = type(value).__name__
        if isinstance(value, (list, dict)):
            value_preview = f"{value_type} with {len(value)} items"
        elif isinstance(value, str) and len(value) > 50:
            value_preview = f"{value[:50]}..."
        else:
            value_preview = str(value)
        print(f"  {i:2d}. {key:30s} ({value_type:10s}): {value_preview}")
    
    return first_game

def compare_structures(csv_headers, json_sample):
    """Compare CSV and JSON structures to identify field mappings"""
    print("\n" + "=" * 80)
    print("FIELD MAPPING ANALYSIS")
    print("=" * 80)
    
    json_fields = set(json_sample.keys())
    csv_fields = set(csv_headers)
    
    # Exact matches
    exact_matches = json_fields & csv_fields
    print(f"\nExact field name matches ({len(exact_matches)}):")
    for field in sorted(exact_matches):
        print(f"  [OK] {field}")
    
    # CSV only
    csv_only = csv_fields - json_fields
    print(f"\nFields only in CSV ({len(csv_only)}):")
    for field in sorted(csv_only):
        print(f"  [+] {field}")
    
    # JSON only
    json_only = json_fields - csv_fields
    print(f"\nFields only in JSON ({len(json_only)}):")
    for field in sorted(json_only):
        print(f"  [-] {field}")
    
    # Potential mappings
    print("\nPotential field name mappings:")
    mappings = {
        'appid': 'game_id',
        'discount': '(new field)',
        'pct_pos_total': '(new field - percentage positive)',
        'num_reviews_total': '(new field)',
        'pct_pos_recent': '(new field)',
        'num_reviews_recent': '(new field)',
    }
    
    for csv_field, json_field in mappings.items():
        if csv_field in csv_only:
            print(f"  CSV '{csv_field}' → JSON '{json_field}'")

def create_field_mapping():
    """Create mapping between CSV fields and JSON fields"""
    # Direct mappings (CSV field -> JSON field)
    mapping = {
        'appid': 'game_id',
        'name': 'name',
        'release_date': 'release_date',
        'required_age': 'required_age',
        'price': 'price',
        'dlc_count': 'dlc_count',
        'detailed_description': 'detailed_description',
        'about_the_game': 'about_the_game',
        'short_description': 'short_description',
        'reviews': 'reviews',
        'header_image': 'header_image',
        'website': 'website',
        'support_url': 'support_url',
        'support_email': 'support_email',
        'windows': 'windows',
        'mac': 'mac',
        'linux': 'linux',
        'metacritic_score': 'metacritic_score',
        'metacritic_url': 'metacritic_url',
        'achievements': 'achievements',
        'recommendations': 'recommendations',
        'notes': 'notes',
        'supported_languages': 'supported_languages',
        'full_audio_languages': 'full_audio_languages',
        'packages': 'packages',
        'developers': 'developers',
        'publishers': 'publishers',
        'categories': 'categories',
        'genres': 'genres',
        'screenshots': 'screenshots',
        'movies': 'movies',
        'user_score': 'user_score',
        'score_rank': 'score_rank',
        'positive': 'positive',
        'negative': 'negative',
        'estimated_owners': 'estimated_owners',
        'average_playtime_forever': 'average_playtime_forever',
        'average_playtime_2weeks': 'average_playtime_2weeks',
        'median_playtime_forever': 'median_playtime_forever',
        'median_playtime_2weeks': 'median_playtime_2weeks',
        'peak_ccu': 'peak_ccu',
        'tags': 'tags',
    }
    
    return mapping

def parse_csv_value(value, field_type):
    """Parse CSV string value to appropriate type"""
    if not value or value == '':
        if field_type == 'list':
            return []
        elif field_type == 'dict':
            return {}
        elif field_type == 'bool':
            return False
        elif field_type == 'int':
            return 0
        elif field_type == 'float':
            return 0.0
        else:
            return ""
    
    try:
        if field_type in ['list', 'dict']:
            # Use ast.literal_eval to safely parse Python literal structures
            return ast.literal_eval(value)
        elif field_type == 'bool':
            return value.lower() == 'true'
        elif field_type == 'int':
            return int(float(value))  # Convert via float to handle decimals
        elif field_type == 'float':
            return float(value)
        else:
            return value
    except Exception as e:
        print(f"Warning: Failed to parse value '{value[:50]}...' as {field_type}: {e}")
        if field_type == 'list':
            return []
        elif field_type == 'dict':
            return {}
        elif field_type == 'bool':
            return False
        elif field_type == 'int':
            return 0
        elif field_type == 'float':
            return 0.0
        else:
            return str(value)

def load_all_json_data(data_dir):
    """Load and combine all existing JSON chunks"""
    print("\nLoading existing JSON data...")
    all_data = {}
    allowed_fields = set()
    
    for i in range(0, 11):  # chunk_0 to chunk_10
        chunk_file = data_dir / f"chunk_{i}.json"
        if chunk_file.exists():
            try:
                file_size = chunk_file.stat().st_size
                if file_size == 0:
                    print(f"  Skipping {chunk_file.name} (empty file)")
                    continue
                    
                print(f"  Loading {chunk_file.name}...", end=" ")
                with open(chunk_file, 'r', encoding='utf-8') as f:
                    chunk_data = json.load(f)
                    
                    # Get field names from first game to know schema
                    if not allowed_fields and chunk_data:
                        first_game = next(iter(chunk_data.values()))
                        allowed_fields = set(first_game.keys())
                    
                    all_data.update(chunk_data)
                    print(f"[OK] ({len(chunk_data)} games)")
            except Exception as e:
                print(f"✗ Error: {e}")
    
    print(f"Total existing games loaded: {len(all_data)}")
    if allowed_fields:
        print(f"Schema fields: {len(allowed_fields)}")
    
    return all_data, allowed_fields

def load_csv_data(csv_file, allowed_fields):
    """Load new CSV data and convert to proper format, keeping only allowed fields"""
    print(f"\nLoading new CSV data from {csv_file.name}...")
    print(f"  Keeping only fields that exist in old data schema...")
    new_data = {}
    
    # Field type mapping for proper conversion
    field_types = {
        'required_age': 'int',
        'price': 'float',
        'dlc_count': 'int',
        'windows': 'bool',
        'mac': 'bool',
        'linux': 'bool',
        'metacritic_score': 'int',
        'achievements': 'int',
        'recommendations': 'int',
        'supported_languages': 'list',
        'full_audio_languages': 'list',
        'packages': 'list',
        'developers': 'list',
        'publishers': 'list',
        'categories': 'list',
        'genres': 'list',
        'screenshots': 'list',
        'movies': 'list',
        'user_score': 'int',
        'positive': 'int',
        'negative': 'int',
        'average_playtime_forever': 'int',
        'average_playtime_2weeks': 'int',
        'median_playtime_forever': 'int',
        'median_playtime_2weeks': 'int',
        'peak_ccu': 'int',
        'tags': 'dict',
    }
    
    skipped_fields = set()
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            app_id = row['appid']
            game_data = {}
            
            for csv_field, value in row.items():
                if csv_field == 'appid':
                    continue  # Skip app_id, use as key
                
                # Only keep fields that exist in old data schema
                if csv_field not in allowed_fields:
                    skipped_fields.add(csv_field)
                    continue
                
                # Convert field value to proper type
                field_type = field_types.get(csv_field, 'str')
                game_data[csv_field] = parse_csv_value(value, field_type)
            
            new_data[app_id] = game_data
    
    if skipped_fields:
        print(f"  Skipped new fields not in old schema: {', '.join(sorted(skipped_fields))}")
    
    print(f"Total new games loaded: {len(new_data)}")
    return new_data

def merge_datasets(old_data, new_data):
    """Merge old and new datasets by app ID - LEFT JOIN on old data"""
    print("\nMerging datasets (LEFT JOIN - keeping all old data)...")
    print(f"  Old data: {len(old_data)} games")
    print(f"  New data: {len(new_data)} games")
    
    # Start with a COPY of old data (deep copy)
    import copy
    merged = copy.deepcopy(old_data)
    
    # Track statistics
    updated = 0
    added = 0
    not_in_new = 0
    
    # Check how many old games are in new data
    old_ids_in_new = set(old_data.keys()) & set(new_data.keys())
    print(f"  Games in both datasets: {len(old_ids_in_new)}")
    print(f"  Games only in old: {len(old_data) - len(old_ids_in_new)}")
    print(f"  Games only in new: {len(new_data) - len(old_ids_in_new)}")
    
    # Update old games with new data
    for app_id in old_data.keys():
        if app_id in new_data:
            # Update existing game with new data values
            merged[app_id].update(new_data[app_id])
            updated += 1
        else:
            # Keep old game as-is
            not_in_new += 1
    
    # Add new games that aren't in old data
    for app_id in new_data.keys():
        if app_id not in old_data:
            merged[app_id] = new_data[app_id]
            added += 1
    
    print(f"\nMerge complete:")
    print(f"  Total games in merged: {len(merged)}")
    print(f"  Updated from new data: {updated}")
    print(f"  Kept from old only: {not_in_new}")
    print(f"  Added new games: {added}")
    
    # Verify no data loss
    if len(merged) < len(old_data):
        print(f"\n!!! WARNING: Data loss detected! Old: {len(old_data)}, Merged: {len(merged)} !!!")
        missing = set(old_data.keys()) - set(merged.keys())
        print(f"Missing IDs: {list(missing)[:10]}...")
        raise Exception("Data loss detected during merge!")
    
    return merged

def save_merged_json(data, output_file):
    """Save merged data to a single JSON file"""
    print(f"\nSaving merged data to {output_file.name}...")
    
    # Create output directory if it doesn't exist
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    
    file_size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"  [OK] Saved {len(data)} games ({file_size_mb:.2f} MB)")
    print(f"\nMerged data saved to: {output_file}")

def split_into_chunks(data, num_chunks, output_dir):
    """Split merged data into chunks and write back to directory"""
    print(f"\nSplitting data into {num_chunks} chunks...")
    
    # Convert to sorted list for consistent ordering
    items = sorted(data.items(), key=lambda x: x[0])
    total_items = len(items)
    chunk_size = (total_items + num_chunks - 1) // num_chunks
    
    print(f"  Total games: {total_items}")
    print(f"  Chunk size: ~{chunk_size} games per chunk")
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Write chunks
    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size, total_items)
        chunk_items = items[start_idx:end_idx]
        chunk_data = dict(chunk_items)
        
        chunk_file = output_dir / f"chunk_{i}.json"
        with open(chunk_file, 'w', encoding='utf-8') as f:
            json.dump(chunk_data, f, separators=(',', ':'))
        
        file_size_mb = chunk_file.stat().st_size / (1024 * 1024)
        print(f"  [OK] chunk_{i}.json: {len(chunk_data)} games ({file_size_mb:.2f} MB)")
    
    print(f"\nAll {num_chunks} chunks written to: {output_dir}")

def main():
    import sys
    
    print("Steam Data Analysis and Merge Tool")
    print("=" * 80)
    
    # Check for command line argument
    if len(sys.argv) > 1 and sys.argv[1] in ['--merge', '--test']:
        test_mode = sys.argv[1] == '--test'
        
        if test_mode:
            print("MODE: TEST MERGE (no files will be modified)")
        else:
            print("MODE: MERGE AND SPLIT")
        print("=" * 80)
        
        # Load existing data
        old_data, allowed_fields = load_all_json_data(OLD_DATA_DIR)
        
        # Load new CSV data (only fields that exist in old data)
        new_data = load_csv_data(NEW_DATA_FILE, allowed_fields)
        
        # Merge datasets
        merged_data = merge_datasets(old_data, new_data)
        
        if test_mode:
            print("\n" + "=" * 80)
            print("TEST COMPLETE - No files modified")
            print("=" * 80)
            print("\nRun with --merge to actually update the files")
        else:
            # Create backup before modifying
            print("\nCreating backup of old chunks...")
            backup_dir = PROJECT_ROOT / "backup_chunks"
            backup_dir.mkdir(exist_ok=True)
            import shutil
            for chunk_file in OLD_DATA_DIR.glob("chunk_*.json"):
                shutil.copy2(chunk_file, backup_dir / chunk_file.name)
            print(f"  Backup created at: {backup_dir}")
            
            # Split into chunks
            split_into_chunks(merged_data, NUM_CHUNKS, OLD_DATA_DIR)
            
            print("\n" + "=" * 80)
            print("MERGE COMPLETE!")
            print("=" * 80)
            print(f"\nBackup available at: {backup_dir}")
            print("If anything went wrong, restore from backup")
        print(f"\nData has been merged and split into {NUM_CHUNKS} chunks in:")
        print(f"  {OUTPUT_DIR}")
        
    else:
        print("MODE: ANALYSIS ONLY")
        print("=" * 80)
        
        # Step 1: Analyze structures
        csv_headers = analyze_csv_structure(NEW_DATA_FILE, num_samples=2)
        json_sample = analyze_json_structure(OLD_DATA_DIR)
        compare_structures(csv_headers, json_sample)
        
        print("\n" + "=" * 80)
        print("ANALYSIS COMPLETE")
        print("=" * 80)
        print("\nNext steps:")
        print("1. Review the field mappings above")
        print("2. Confirm the structure looks correct")
        print("3. Run with --merge flag to combine datasets:")
        print(f"   python script/analyze_and_merge_data.py --merge")
        print("\nNote: New CSV fields will be added to the JSON structure:")
        print("  - discount")
        print("  - pct_pos_total, num_reviews_total")
        print("  - pct_pos_recent, num_reviews_recent")

if __name__ == "__main__":
    main()
