import random

main_categories = {  
    "APPAREL": {  
        "JACKETS & VESTS": [50, 250],  
        "OTHER": [10, 100],  
        "PANTS & SHORTS": [30, 120],  
        "SHIRTS": [20, 80],  
        "TOPS": [15, 60],  
        "UNDERWEAR & BASE LAYERS": [10, 50]  
    },  
    "CAMPING & HIKING": {  
        "BACKPACKING TENTS": [100, 500],  
        "BIVYS": [50, 200],  
        "COOKWARE": [20, 150],  
        "DAYPACKS": [30, 150],  
        "EXTENDED TRIP PACKS": [150, 400],  
        "FAMILY CAMPING TENTS": [200, 800],  
        "FOOD & NUTRITION": [5, 50],  
        "HAMMOCKS": [30, 150],  
        "HYDRATION PACKS": [40, 120],  
        "LINERS": [10, 60],  
        "OTHER": [5, 100],  
        "OVERNIGHT PACKS": [80, 250],  
        "SHELTERS & TARPS": [40, 200],  
        "SLEEPING BAGS": [60, 300],  
        "SLEEPING PADS": [30, 150],  
        "STOVES": [20, 150],  
        "UTENSILS & ACCESSORIES": [5, 50]  
    },  
    "CLIMBING": {  
        "AVALANCHE SAFETY": [100, 500],  
        "CARABINERS & QUICKDRAWS": [5, 50],  
        "CHALK & CHALK BAGS": [5, 30],  
        "CLIMBING SHOES": [60, 200],  
        "CRAMPONS": [100, 300],  
        "HARNESSES": [50, 200],  
        "HELMETS": [40, 150],  
        "ICE AXES": [50, 300],  
        "MOUNTAINEERING BOOTS": [150, 500],  
        "OTHER": [10, 100],  
        "ROPES & SLINGS": [30, 300],  
        "TRAINING EQUIPMENT": [20, 150]  
    },  
    "FOOTWEAR": {  
        "HIKING BOOTS": [60, 250],  
        "OTHER": [20, 100],  
        "SANDALS": [20, 80],  
        "TRAIL SHOES": [50, 150],  
        "WINTER BOOTS": [60, 200]  
    },  
    "TRAVEL": {  
        "CARRY-ONS": [50, 200],  
        "DUFFEL BAGS": [30, 150],  
        "EYE MASKS": [5, 20],  
        "OTHER": [5, 50],  
        "PACKING ORGANIZERS": [10, 50],  
        "SECURITY": [10, 100],  
        "TRAVEL ACCESSORIES": [5, 80],  
        "TRAVEL BACKPACKS": [30, 200],  
        "TRAVEL PILLOWS": [10, 40]  
    },  
    "WATER SPORTS": {  
        "ACCESSORIES": [10, 100],  
        "CANOES": [300, 1200],  
        "KAYAKS": [200, 1000],  
        "OTHER": [10, 100],  
        "PADDLES": [20, 150],  
        "RASH GUARDS": [20, 80],  
        "RODS & REELS": [30, 200],  
        "SAFETY GEAR": [20, 100],  
        "SURF ACCESSORIES": [10, 100],  
        "SURFBOARDS": [200, 800],  
        "TACKLE": [5, 50],  
        "WADERS": [50, 200],  
        "WETSUITS": [50, 300]  
    },  
    "WINTER SPORTS": {  
        "ACCESSORIES": [10, 100],  
        "BINDINGS": [80, 300],  
        "HELMETS": [40, 150],  
        "OTHER": [10, 100],  
        "POLES": [20, 100],  
        "SKI BINDINGS": [100, 300],  
        "SKI BOOTS": [150, 500],  
        "SKI POLES": [30, 120],  
        "SKIS": [200, 800],  
        "SNOWBOARD BOOTS": [100, 300],  
        "SNOWBOARDS": [200, 800],  
        "SNOWSHOES": [50, 200]  
    }  
}

regions = ['AFRICA', 'ASIA-PACIFIC', 'EUROPE', 'MIDDLE EAST', 'NORTH AMERICA', 'LATIN AMERICA']
years = [2021, 2022, 2023, 2024]

def generate_sql_insert():  
    insert_statements = []

    for i in range(1000):  
        main_category = random.choice(list(main_categories.keys()))  
        product_category = main_categories[main_category]
        product_type = random.choice(list(product_category.keys()))  
        price_range = product_category[product_type]  
        number_of_orders = random.randint(1, 20)  
        revenue = random.randint(price_range[0], price_range[1]) * number_of_orders

        shipping_cost_percentage = random.randint(10, 20) / 100.0
        shipping_cost = shipping_cost_percentage * revenue

        discount_percentage = random.randint(0, 15)
        discount_decimal = discount_percentage / 100.0
        discount = discount_decimal * revenue

        year = random.choice(years)  
        month = random.randint(1, 12)  
        region = random.choice(regions)  
        month_date = f"{year}-{str(month).zfill(2)}"

        insert_statements.append(  
            f"INSERT INTO sales_data (main_category, product_type, revenue, shipping_cost, number_of_orders, year, month, discount, region, month_date) "  
            f"VALUES ('{main_category}', '{product_type}', {revenue}, {shipping_cost}, {number_of_orders}, {year}, {month}, {discount}, '{region}', '{month_date}');"  
        )

    return "\n".join(insert_statements)

sql_script = f"""  
-- Create the table  
CREATE TABLE IF NOT EXISTS sales_data (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    main_category TEXT,  
    product_type TEXT,  
    revenue REAL,  
    shipping_cost REAL,
    number_of_orders INTEGER,  
    year INTEGER,  
    month INTEGER,  
    discount INTEGER,  
    region TEXT,  
    month_date TEXT  
);

-- Insert random records into the table  
{generate_sql_insert()}    
"""

# Write the SQL script to a file  
with open("populate_sales_data.sql", "w") as file:  
    file.write(sql_script)

print("SQL script has been written to 'populate_sales_data.sql'")
