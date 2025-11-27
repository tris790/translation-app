import { useForm } from "react-hook-form";

export const FormPage = () => {
    const form = useForm();

    return (
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
            <label htmlFor="name">Name:</label>
            <input {...form.register("name")} />

            <label htmlFor="age">Age:</label>
            <input {...form.register("age")} />

            <button type="submit">Submit</button>
        </form>
    );
};
