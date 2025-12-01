import { test, expect, describe } from "bun:test";
import { generatePropsData } from "../engine/PropsDataGenerator";
import { ContactMethod, Priority, Rating } from "../example/components/ContactPage";

describe("PropsDataGenerator", () => {
    describe("Primitive types", () => {
        test("should generate string values", () => {
            const result = generatePropsData([{ name: "title", type: "string" }]);
            expect(typeof result.title).toBe("string");
        });

        test("should generate number values", () => {
            const result = generatePropsData([{ name: "count", type: "number" }]);
            expect(typeof result.count).toBe("number");
        });

        test("should generate boolean values", () => {
            const result = generatePropsData([{ name: "isActive", type: "boolean" }]);
            expect(typeof result.isActive).toBe("boolean");
        });
    });

    describe("String semantic inference", () => {
        test("should generate email format for email properties", () => {
            const result = generatePropsData([{ name: "email", type: "string" }]);
            expect(result.email).toContain("@");
            expect(result.email).toContain("example.com");
        });

        test("should generate name format for name properties", () => {
            const result = generatePropsData([{ name: "userName", type: "string" }]);
            expect(result.userName).toBe("John Doe");
        });

        test("should generate phone format for phone properties", () => {
            const result = generatePropsData([{ name: "phoneNumber", type: "string" }]);
            expect(result.phoneNumber).toContain("555");
        });

        test("should generate IP format for ip properties", () => {
            const result = generatePropsData([{ name: "ipAddress", type: "string" }]);
            expect(result.ipAddress).toBe("127.0.0.1");
        });

        test("should generate port format for port properties", () => {
            const result = generatePropsData([{ name: "port", type: "string" }]);
            expect(result.port).toBe("8080");
        });

        test("should generate address format for address properties", () => {
            const result = generatePropsData([{ name: "address", type: "string" }]);
            expect(result.address).toContain("Main St");
        });

        test("should generate GUID format for id properties", () => {
            const result = generatePropsData([{ name: "userId", type: "string" }]);
            expect(result.userId).toMatch(/^[a-f0-9-]{36}$/);
        });

        test("should generate age format for age properties", () => {
            const result = generatePropsData([{ name: "age", type: "string" }]);
            expect(result.age).toBe("30");
        });
    });

    describe("Number semantic inference", () => {
        test("should generate random number", () => {
            const result = generatePropsData([{ name: "count", type: "number" }]);
            expect(result.count).toBeGreaterThanOrEqual(0);
            expect(result.count).toBeLessThan(100);
        });
    });

    describe("Boolean semantic inference", () => {
        test("should return true for show properties", () => {
            const result = generatePropsData([{ name: "showModal", type: "boolean" }]);
            expect(result.showModal).toBe(true);
        });

        test("should return true for active properties", () => {
            const result = generatePropsData([{ name: "isActive", type: "boolean" }]);
            expect(result.isActive).toBe(true);
        });

        test("should return true for enabled properties", () => {
            const result = generatePropsData([{ name: "isEnabled", type: "boolean" }]);
            expect(result.isEnabled).toBe(true);
        });

        test("should return false for hide properties", () => {
            const result = generatePropsData([{ name: "hideContent", type: "boolean" }]);
            expect(result.hideContent).toBe(false);
        });

        test("should return false for disabled properties", () => {
            const result = generatePropsData([{ name: "isDisabled", type: "boolean" }]);
            expect(result.isDisabled).toBe(false);
        });

        test("should return random boolean for generic properties", () => {
            const result = generatePropsData([{ name: "flag", type: "boolean" }]);
            expect(typeof result.flag).toBe("boolean");
        });
    });

    describe("Array types", () => {
        test("should generate string array", () => {
            const result = generatePropsData([{ name: "tags", type: "string[]" }]);
            expect(Array.isArray(result.tags)).toBe(true);
            expect(result.tags.length).toBeGreaterThanOrEqual(2);
            expect(result.tags.length).toBeLessThanOrEqual(3);
            result.tags.forEach((tag: any) => {
                expect(typeof tag).toBe("string");
            });
        });

        test("should generate number array", () => {
            const result = generatePropsData([{ name: "scores", type: "number[]" }]);
            expect(Array.isArray(result.scores)).toBe(true);
            expect(result.scores.length).toBeGreaterThanOrEqual(2);
            expect(result.scores.length).toBeLessThanOrEqual(3);
            result.scores.forEach((score: any) => {
                expect(typeof score).toBe("number");
            });
        });

        test("should generate boolean array", () => {
            const result = generatePropsData([{ name: "flags", type: "boolean[]" }]);
            expect(Array.isArray(result.flags)).toBe(true);
            expect(result.flags.length).toBeGreaterThanOrEqual(2);
            expect(result.flags.length).toBeLessThanOrEqual(3);
            result.flags.forEach((flag: any) => {
                expect(typeof flag).toBe("boolean");
            });
        });
    });

    describe("Union types", () => {
        test("should handle string | null union", () => {
            const result = generatePropsData([{ name: "title", type: "string | null" }]);
            expect(typeof result.title).toBe("string");
        });

        test("should handle Date | null union", () => {
            const result = generatePropsData([{ name: "createdAt", type: "Date | null" }]);
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        test("should handle number | undefined union", () => {
            const result = generatePropsData([{ name: "count", type: "number | undefined" }]);
            expect(typeof result.count).toBe("number");
        });

        test("should handle null | undefined union", () => {
            const result = generatePropsData([{ name: "value", type: "null | undefined" }]);
            expect(result.value).toBe(null);
        });
    });

    describe("Date types", () => {
        test("should generate Date objects", () => {
            const result = generatePropsData([{ name: "createdAt", type: "Date" }]);
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        test("should generate Date for date property names", () => {
            const result = generatePropsData([{ name: "publishDate", type: "Date" }]);
            expect(result.publishDate).toBeInstanceOf(Date);
        });
    });

    describe("Function types", () => {
        test("should generate function for arrow function type", () => {
            const result = generatePropsData([{ name: "onClick", type: "() => void" }]);
            expect(typeof result.onClick).toBe("function");
        });

        test("should generate function for function keyword type", () => {
            const result = generatePropsData([{ name: "handler", type: "function" }]);
            expect(typeof result.handler).toBe("function");
        });

        test("should generate function with parameters", () => {
            const result = generatePropsData([{ name: "onChange", type: "(value: string) => void" }]);
            expect(typeof result.onChange).toBe("function");
        });
    });

    describe("Object types", () => {
        test("should generate object for object type", () => {
            const result = generatePropsData([{ name: "config", type: "object" }]);
            expect(typeof result.config).toBe("object");
            expect(result.config).not.toBeNull();
        });

        test("should generate address object for address property", () => {
            const result = generatePropsData([{ name: "homeAddress", type: "object" }]);
            expect(result.homeAddress).toHaveProperty("street");
            expect(result.homeAddress).toHaveProperty("city");
            expect(result.homeAddress).toHaveProperty("state");
            expect(result.homeAddress).toHaveProperty("zip");
        });

        test("should generate user object for user property", () => {
            const result = generatePropsData([{ name: "currentUser", type: "object" }]);
            expect(result.currentUser).toHaveProperty("name");
            expect(result.currentUser).toHaveProperty("email");
            expect(result.currentUser).toHaveProperty("age");
        });

        test("should generate person object for person property", () => {
            const result = generatePropsData([{ name: "person", type: "object" }]);
            expect(result.person).toHaveProperty("name");
            expect(result.person).toHaveProperty("email");
        });

        test("should generate default object for generic object", () => {
            const result = generatePropsData([{ name: "data", type: "object" }]);
            expect(result.data).toHaveProperty("id");
            expect(result.data).toHaveProperty("name");
            expect(result.data).toHaveProperty("value");
        });

        test("should generate object for inline type definition", () => {
            const result = generatePropsData([{ name: "settings", type: "{ theme: string }" }]);
            expect(typeof result.settings).toBe("object");
            expect(result.settings).not.toBeNull();
        });
    });

    describe("Complex scenarios", () => {
        test("should handle multiple properties at once", () => {
            const result = generatePropsData([
                { name: "title", type: "string" },
                { name: "count", type: "number" },
                { name: "isActive", type: "boolean" },
                { name: "tags", type: "string[]" },
                { name: "createdAt", type: "Date" },
                { name: "onClick", type: "() => void" },
            ]);

            expect(typeof result.title).toBe("string");
            expect(typeof result.count).toBe("number");
            expect(typeof result.isActive).toBe("boolean");
            expect(Array.isArray(result.tags)).toBe(true);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(typeof result.onClick).toBe("function");
        });

        test("should handle ContactPage props", () => {
            const result = generatePropsData([
                { name: "title", type: "string" },
                { name: "description", type: "string" },
                { name: "email", type: "string" },
                { name: "phoneNumbers", type: "string[]" },
                { name: "referenceNumber", type: "number" },
                { name: "isAvailable", type: "boolean" },
                { name: "availableDate", type: "Date | null" },
            ]);

            expect(typeof result.title).toBe("string");
            expect(typeof result.description).toBe("string");
            expect(result.email).toContain("@");
            expect(Array.isArray(result.phoneNumbers)).toBe(true);
            expect(typeof result.referenceNumber).toBe("number");
            expect(typeof result.isAvailable).toBe("boolean");
            expect(result.availableDate).toBeInstanceOf(Date);
        });

        test("should generate unique values for different properties", () => {
            const result = generatePropsData([
                { name: "id1", type: "string" },
                { name: "id2", type: "string" },
            ]);

            // Both should be GUIDs but different values
            expect(result.id1).toMatch(/^[a-f0-9-]{36}$/);
            expect(result.id2).toMatch(/^[a-f0-9-]{36}$/);
            expect(result.id1).not.toBe(result.id2);
        });

        test("should handle empty props array", () => {
            const result = generatePropsData([]);
            expect(result).toEqual({});
        });
    });

    describe("Enum types", () => {
        test("should generate valid string enum value", () => {
            const result = generatePropsData([
                { name: "contactMethod", type: "ContactMethod", enumValues: ContactMethod as any }
            ]);

            const validValues = Object.values(ContactMethod);
            expect(validValues).toContain(result.contactMethod);
            expect(typeof result.contactMethod).toBe("string");
        });

        test("should generate valid number enum value", () => {
            const result = generatePropsData([
                { name: "priority", type: "Priority", enumValues: Priority as any }
            ]);

            // For number enums, the values are numbers
            const validValues = [Priority.Low, Priority.Medium, Priority.High, Priority.Critical];
            expect(validValues).toContain(result.priority);
            expect(typeof result.priority).toBe("number");
        });

        test("should generate one of the string enum values (ContactMethod)", () => {
            // Run multiple times to ensure we're generating valid values
            for (let i = 0; i < 10; i++) {
                const result = generatePropsData([
                    { name: "contactMethod", type: "ContactMethod", enumValues: ContactMethod as any }
                ]);

                expect([
                    ContactMethod.Email,
                    ContactMethod.Phone,
                    ContactMethod.Mail,
                    ContactMethod.InPerson
                ]).toContain(result.contactMethod);
            }
        });

        test("should generate one of the number enum values (Priority)", () => {
            // Run multiple times to ensure we're generating valid values
            for (let i = 0; i < 10; i++) {
                const result = generatePropsData([
                    { name: "priority", type: "Priority", enumValues: Priority as any }
                ]);

                expect([
                    Priority.Low,    // 0
                    Priority.Medium, // 1
                    Priority.High,   // 2
                    Priority.Critical // 3
                ]).toContain(result.priority);
            }
        });

        test("should handle multiple enum properties", () => {
            const result = generatePropsData([
                { name: "contactMethod", type: "ContactMethod", enumValues: ContactMethod as any },
                { name: "priority", type: "Priority", enumValues: Priority as any }
            ]);

            expect(Object.values(ContactMethod)).toContain(result.contactMethod);
            expect([Priority.Low, Priority.Medium, Priority.High, Priority.Critical]).toContain(result.priority);
        });

        test("should fallback to object when capitalized type without enumValues", () => {
            const result = generatePropsData([
                { name: "contactMethod", type: "ContactMethod" }
            ]);

            // Without enumValues, capitalized types are treated as objects
            expect(typeof result.contactMethod).toBe("object");
        });

        test("should handle auto-incremented number enum (Rating)", () => {
            const result = generatePropsData([
                { name: "rating", type: "Rating", enumValues: Rating as any }
            ]);

            // Rating enum: Bad=0, Ok=1, Good=2
            expect(typeof result.rating).toBe("number");
            expect([Rating.Bad, Rating.Ok, Rating.Good]).toContain(result.rating);
            expect([0, 1, 2]).toContain(result.rating);
        });

        test("should generate correct numeric value for Rating.Ok", () => {
            // Run multiple times to ensure when Ok is generated, it equals 1
            for (let i = 0; i < 20; i++) {
                const result = generatePropsData([
                    { name: "rating", type: "Rating", enumValues: Rating as any }
                ]);

                // Verify the generated value matches the actual enum value
                if (result.rating === Rating.Ok) {
                    expect(result.rating).toBe(1);
                }
                if (result.rating === Rating.Bad) {
                    expect(result.rating).toBe(0);
                }
                if (result.rating === Rating.Good) {
                    expect(result.rating).toBe(2);
                }
            }
        });

        test("should extract auto-incremented enum values from context", () => {
            // Simulate what the Analyzer extracts
            const extractedEnumValues = {
                Bad: 0,
                Ok: 1,
                Good: 2
            };

            const result = generatePropsData([
                { name: "rating", type: "Rating", enumValues: extractedEnumValues }
            ]);

            expect([0, 1, 2]).toContain(result.rating);
            expect(typeof result.rating).toBe("number");
        });

        test("should generate all three Rating values over multiple runs", () => {
            const generatedValues = new Set<number>();

            // Run enough times to likely hit all values
            for (let i = 0; i < 50; i++) {
                const result = generatePropsData([
                    { name: "rating", type: "Rating", enumValues: Rating as any }
                ]);
                generatedValues.add(result.rating);
            }

            // Should have generated all three possible values
            expect(generatedValues.has(0)).toBe(true); // Bad
            expect(generatedValues.has(1)).toBe(true); // Ok
            expect(generatedValues.has(2)).toBe(true); // Good
        });
    });

    describe("Nested objects", () => {
        test("should generate nested address object (3 layers) with properties", () => {
            const result = generatePropsData([
                {
                    name: "address",
                    type: "Address",
                    properties: [
                        { name: "street", type: "string" },
                        { name: "city", type: "string" },
                        { name: "state", type: "string" },
                        { name: "zipCode", type: "string" },
                        {
                            name: "coordinates",
                            type: "{ latitude: number; longitude: number; metadata: { source: string; accuracy: number; lastUpdated: Date; }; }",
                            properties: [
                                { name: "latitude", type: "number" },
                                { name: "longitude", type: "number" },
                                {
                                    name: "metadata",
                                    type: "{ source: string; accuracy: number; lastUpdated: Date; }",
                                    properties: [
                                        { name: "source", type: "string" },
                                        { name: "accuracy", type: "number" },
                                        { name: "lastUpdated", type: "Date" }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]);

            // Check layer 1
            expect(result.address).toBeDefined();
            expect(typeof result.address).toBe("object");
            expect(result.address.street).toBeDefined();
            expect(typeof result.address.street).toBe("string");
            expect(result.address.city).toBeDefined();
            expect(typeof result.address.city).toBe("string");
            expect(result.address.state).toBeDefined();
            expect(typeof result.address.state).toBe("string");
            expect(result.address.zipCode).toBeDefined();
            expect(typeof result.address.zipCode).toBe("string");

            // Check layer 2
            expect(result.address.coordinates).toBeDefined();
            expect(typeof result.address.coordinates).toBe("object");
            expect(typeof result.address.coordinates.latitude).toBe("number");
            expect(typeof result.address.coordinates.longitude).toBe("number");

            // Check layer 3
            expect(result.address.coordinates.metadata).toBeDefined();
            expect(typeof result.address.coordinates.metadata).toBe("object");
            expect(typeof result.address.coordinates.metadata.source).toBe("string");
            expect(typeof result.address.coordinates.metadata.accuracy).toBe("number");
            expect(result.address.coordinates.metadata.lastUpdated).toBeInstanceOf(Date);
        });

        test("should fallback to heuristics when no properties provided", () => {
            const result = generatePropsData([
                { name: "homeAddress", type: "object" }
            ]);

            // Should still generate a generic address object using heuristics
            expect(result.homeAddress).toBeDefined();
            expect(typeof result.homeAddress).toBe("object");
            expect(result.homeAddress).toHaveProperty("street");
            expect(result.homeAddress).toHaveProperty("city");
        });

        test("should recognize capitalized type names as objects", () => {
            const result = generatePropsData([
                { name: "location", type: "Address" }
            ]);

            // Should generate an address object using heuristics
            expect(result.location).toBeDefined();
            expect(typeof result.location).toBe("object");
            expect(result.location).toHaveProperty("street");
            expect(result.location).toHaveProperty("city");
        });

        test("should generate nested object with mixed types", () => {
            const result = generatePropsData([
                {
                    name: "user",
                    type: "User",
                    properties: [
                        { name: "id", type: "string" },
                        { name: "name", type: "string" },
                        { name: "age", type: "number" },
                        { name: "isActive", type: "boolean" },
                        { name: "createdAt", type: "Date" },
                        {
                            name: "profile",
                            type: "{ bio: string; avatar: string; }",
                            properties: [
                                { name: "bio", type: "string" },
                                { name: "avatar", type: "string" }
                            ]
                        }
                    ]
                }
            ]);

            expect(result.user).toBeDefined();
            expect(typeof result.user.id).toBe("string");
            expect(typeof result.user.name).toBe("string");
            expect(typeof result.user.age).toBe("number");
            expect(typeof result.user.isActive).toBe("boolean");
            expect(result.user.createdAt).toBeInstanceOf(Date);
            expect(typeof result.user.profile).toBe("object");
            expect(typeof result.user.profile.bio).toBe("string");
            expect(typeof result.user.profile.avatar).toBe("string");
        });
    });

    describe("Edge cases", () => {
        test("should handle uppercase type names", () => {
            const result = generatePropsData([{ name: "value", type: "String" }]);
            expect(typeof result.value).toBe("string");
        });

        test("should handle type with extra whitespace", () => {
            const result = generatePropsData([{ name: "value", type: "  string  " }]);
            expect(typeof result.value).toBe("string");
        });

        test("should handle complex union types", () => {
            const result = generatePropsData([{ name: "value", type: "string | number | null" }]);
            expect(["string", "number"].includes(typeof result.value)).toBe(true);
        });

        test("should handle unknown capitalized types as objects", () => {
            const result = generatePropsData([{ name: "custom", type: "UnknownType" }]);
            // Capitalized unknown types are treated as objects (fallback to heuristics)
            expect(typeof result.custom).toBe("object");
        });
    });
});
