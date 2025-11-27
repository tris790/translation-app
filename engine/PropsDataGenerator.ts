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

function generateArray(propertyName: string, type: string): any[] {
    const propertyNameLowerCase = propertyName.toLowerCase();

    // Extract inner type if available (e.g., "string[]" -> "string")
    const innerType = type.replace(/\[\]$/, '').trim();

    // Generate 2-3 items for the array
    const count = Math.floor(Math.random() * 2) + 2;
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push(generateValue(`${propertyName}_${i}`, innerType));
    }

    return result;
}

function generateObject(propertyName: string, type: string): any {
    const propertyNameLowerCase = propertyName.toLowerCase();

    // For common object patterns, generate appropriate structures
    if (propertyNameLowerCase.includes("address")) {
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

function generateValue(propertyName: string, type: string): any {
    const typeLower = type.toLowerCase();

    // Handle union types (e.g., "Date | null", "string | undefined")
    // Take the first non-null/undefined type
    if (type.includes('|')) {
        const types = type.split('|').map(t => t.trim());
        const mainType = types.find(t => !t.toLowerCase().includes('null') && !t.toLowerCase().includes('undefined'));
        if (mainType) {
            return generateValue(propertyName, mainType);
        }
        // If all are null/undefined, return null
        return null;
    }

    // Handle array types (must come before string check since string[] contains 'string')
    if (type.endsWith('[]') || typeLower.includes('array<')) {
        return generateArray(propertyName, type);
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

    // Handle date types
    if (typeLower.includes('date')) {
        return new Date();
    }

    // Default to object for complex types
    if (typeLower === 'object' || type.includes('{')) {
        return generateObject(propertyName, type);
    }

    // Fallback
    return generateString(propertyName);
}

export function generatePropsData(props: Array<{ name: string; type: string }>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const prop of props) {
        const value = generateValue(prop.name, prop.type);
        result[prop.name] = value;
    }

    return result;
}
