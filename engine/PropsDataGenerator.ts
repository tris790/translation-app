function generateGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        },
    );
}

function generateString(propertyName: string): string {
    const propertyNameLowerCase = propertyName.toLowerCase();
    if (propertyNameLowerCase.includes("ip")) {
        return "127.0.0.1";
    }

    if (propertyNameLowerCase.includes("port")) {
        return "8080";
    }

    if (propertyNameLowerCase.includes("name")) {
        return "John Doe";
    }

    if (propertyNameLowerCase.includes("age")) {
        return "30";
    }

    if (propertyNameLowerCase.includes("email")) {
        return "john.doe@example.com";
    }

    if (propertyNameLowerCase.includes("address")) {
        return "123 Main St.";
    }

    if (propertyNameLowerCase.includes("phone")) {
        return "+1 (555) 555-5555";
    }

    if (propertyNameLowerCase.includes("id")) {
        return generateGUID();
    }

    return "random string";
}

function generateNumber(propertyName: string): number {
    const propertyNameLowerCase = propertyName.toLowerCase();

    return Math.floor(Math.random() * 100);
}

function generateBoolean(propertyName: string): boolean {
    const propertyNameLowerCase = propertyName.toLowerCase();

    if (propertyNameLowerCase.includes("show")) {
        return true;
    }

    if (propertyNameLowerCase.includes("activ")) {
        return true;
    }

    if (propertyNameLowerCase.includes("enabl")) {
        return true;
    }

    if (propertyNameLowerCase.includes("hide")) {
        return false;
    }

    if (propertyNameLowerCase.includes("disabl")) {
        return false;
    }

    return Math.random() > 0.5;
}

function generateArray(propertyName: string, type: string, enumValues?: Record<string, string | number>, properties?: any[]): any[] {
    const propertyNameLowerCase = propertyName.toLowerCase();

    // Extract inner type if available (e.g., "string[]" -> "string")
    const innerType = type.replace(/\[\]$/, '').trim();

    // Generate 2-3 items for the array
    const count = Math.floor(Math.random() * 2) + 2;
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push(generateValue(`${propertyName}_${i}`, innerType, enumValues, properties));
    }

    return result;
}

function generateObject(propertyName: string, type: string, properties?: any[]): any {
    // If we have extracted properties, use them to generate the object
    if (properties && properties.length > 0) {
        const result: Record<string, any> = {};

        for (const prop of properties) {
            result[prop.name] = generateValue(
                prop.name,
                prop.type,
                prop.enumValues,
                prop.properties
            );
        }

        return result;
    }

    // Fallback: use heuristic-based generation for types without extracted structure
    const propertyNameLowerCase = propertyName.toLowerCase();
    const typeLower = type.toLowerCase();

    if (propertyNameLowerCase.includes("address") || typeLower.includes("address")) {
        return {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001"
        };
    }

    if (propertyNameLowerCase.includes("user") || propertyNameLowerCase.includes("person")) {
        return {
            name: "John Doe",
            email: "john.doe@example.com",
            age: 30
        };
    }

    // Default object with a few common properties
    return {
        id: generateGUID(),
        name: generateString(propertyName),
        value: generateString(propertyName)
    };
}

function generateEnum(propertyName: string, type: string, enumValues?: Record<string, string | number>): any {
    // If enum values are provided, pick a random one
    if (enumValues) {
        const entries = Object.entries(enumValues);

        // Check if this is a number enum by seeing if any value is a number
        const hasNumberValue = entries.some(([key, value]) => typeof value === 'number');

        if (hasNumberValue) {
            // For number enums, TypeScript creates reverse mapping (0 -> "Low", "Low" -> 0)
            // We only want the numeric values
            const numericValues = entries
                .filter(([key, value]) => typeof value === 'number')
                .map(([key, value]) => value as number);
            return numericValues[Math.floor(Math.random() * numericValues.length)];
        } else {
            // For string enums, all values are strings
            const stringValues = entries
                .filter(([key, value]) => typeof value === 'string')
                .map(([key, value]) => value as string);
            return stringValues[Math.floor(Math.random() * stringValues.length)];
        }
    }

    // Fallback: generate a string value
    return generateString(propertyName);
}

function generateValue(propertyName: string, type: string, enumValues?: Record<string, string | number>, properties?: any[]): any {
    const typeLower = type.toLowerCase();

    // Handle union types (e.g., "Date | null", "string | undefined")
    // Take the first non-null/undefined type
    if (type.includes('|')) {
        const types = type.split('|').map(t => t.trim());
        const mainType = types.find(t => !t.toLowerCase().includes('null') && !t.toLowerCase().includes('undefined'));
        if (mainType) {
            return generateValue(propertyName, mainType, enumValues, properties);
        }
        // If all are null/undefined, return null
        return null;
    }

    // If properties are provided, this is definitely an object/interface
    // This must come early to prevent type string pattern matching (e.g., "{ ... Date ... }" matching date)
    if (properties && properties.length > 0) {
        return generateObject(propertyName, type, properties);
    }

    // Check if this is an enum type (if enumValues provided)
    if (enumValues) {
        return generateEnum(propertyName, type, enumValues);
    }

    // Handle array types (must come before string check since string[] contains 'string')
    if (type.endsWith('[]') || typeLower.includes('array<')) {
        return generateArray(propertyName, type, enumValues, properties);
    }

    // Handle specific primitive types
    if (typeLower === 'string' || typeLower === 'string') {
        return generateString(propertyName);
    }

    if (typeLower === 'number') {
        return generateNumber(propertyName);
    }

    if (typeLower === 'boolean') {
        return generateBoolean(propertyName);
    }

    // Handle function types
    if (typeLower.includes('=>') || typeLower.includes('function')) {
        return () => console.log(`${propertyName} called`);
    }

    // Handle object/complex types BEFORE date check
    // This prevents "{ ... Date ... }" from matching the date check
    if (typeLower === 'object' || type.includes('{')) {
        return generateObject(propertyName, type, properties);
    }

    // Handle date types early (must come BEFORE capitalized type check since Date is capitalized)
    if (typeLower === 'date') {
        return new Date();
    }

    // Handle custom types (capitalized names) as objects
    // e.g., Address, User, Product - likely interfaces/types
    if (/^[A-Z][a-zA-Z0-9]*$/.test(type)) {
        return generateObject(propertyName, type, properties);
    }

    // Fallback for unknown types (including enums without enumValues)
    return generateString(propertyName);
}

export function generatePropsData(
    props: Array<{ name: string; type: string; enumValues?: Record<string, string | number>; properties?: any[] }>
): Record<string, any> {
    const result: Record<string, any> = {};

    for (const prop of props) {
        const value = generateValue(prop.name, prop.type, prop.enumValues, prop.properties);
        result[prop.name] = value;
    }

    return result;
}
