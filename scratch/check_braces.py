
import sys

def check_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    line_num = 1
    char_num = 1
    
    for char in content:
        if char == '{':
            stack.append((line_num, char_num))
        elif char == '}':
            if not stack:
                print(f"Extra closing brace at line {line_num}, char {char_num}")
            else:
                stack.pop()
        
        if char == '\n':
            line_num += 1
            char_num = 1
        else:
            char_num += 1
            
    if stack:
        for line, char in stack:
            print(f"Unclosed brace starting at line {line}, char {char}")
    else:
        print("All braces are balanced.")

if __name__ == "__main__":
    check_braces(sys.argv[1])
