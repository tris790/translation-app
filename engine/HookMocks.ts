function useFormMock() {
    return {
        register: () => {},
        handleSubmit: () => {},
        formState: {
            errors: {},
            touchedFields: {},
            isDirty: false,
            isSubmitted: false,
            isValid: true,
        },
    };
}

function useQueryMock() {
    return {
        queryKey: [],
        queryFn: () => Promise.resolve({}),
        queryOptions: {},
    };
}
