import json
import sys

def json_to_sql(json_file, sql_file):
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        with open(sql_file, 'w') as f:
            for entry in data:
                model = entry.get('model')
                pk = entry.get('pk')
                fields = entry.get('fields', {})
                
                # Determine table name and column names based on model
                if model == 'admin.logentry':
                    table_name = 'logentry'
                    columns = ['id', 'action_time', 'user_id', 'content_type_id', 'object_id', 'object_repr', 'action_flag', 'change_message']
                    values = [
                        pk,
                        f"'{fields.get('action_time')}'",
                        fields.get('user'),
                        fields.get('content_type'),
                        f"'{fields.get('object_id')}'",
                        f"'{fields.get('object_repr')}'",
                        fields.get('action_flag'),
                        f"'{fields.get('change_message')}'"
                    ]
                    sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(map(str, values))});\n"
                    f.write(sql)
                
        print("SQL file created successfully.")

    except json.JSONDecodeError:
        print("Error decoding JSON. Please check the format of your JSON file.")
    except FileNotFoundError:
        print(f"File not found: {json_file}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python json_to_sql.py <json_file> <sql_file>")
    else:
        json_to_sql(sys.argv[1], sys.argv[2])
