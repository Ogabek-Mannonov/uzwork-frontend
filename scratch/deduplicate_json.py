
import json
import sys
from collections import OrderedDict

def merge_dicts(dict1, dict2):
    for key, value in dict2.items():
        if key in dict1 and isinstance(dict1[key], dict) and isinstance(value, dict):
            merge_dicts(dict1[key], value)
        else:
            dict1[key] = value

def deduplicate_json(filename):
    # We can't easily use json.load because of duplicates (it just takes the last one)
    # But we want to merge them.
    # So we'll use a custom object_pair_hook.
    
    def handle_duplicates(pairs):
        d = OrderedDict()
        for k, v in pairs:
            if k in d:
                if isinstance(d[k], dict) and isinstance(v, dict):
                    merge_dicts(d[k], v)
                else:
                    d[k] = v
            else:
                d[k] = v
        return d

    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f, object_pairs_hook=handle_duplicates)
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    deduplicate_json(sys.argv[1])
