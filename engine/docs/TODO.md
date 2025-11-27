# Todos
## Guidelines
- Don't make additional files to document
- When done ask user if it is really done then update engine/docs/TODO.md and check [x] the todo if he tells you it is done
- Ask for clarification on the todo when it is too vague to implement

[x] Make a context command in the root package.json that launch the engine instead of the app. The engine itself is application agnostic and could work with any application, it just needs to be rendered as a normal React app and will use the its json file to have the required data to work.
[x] Update the engine shell to render the different components properly and be able to switch between them.
[x] Make the engine darkmode only
[x] Implement an application analyzer (engine/Analyzer.ts) that for a given application path and a configuration, will analyze the application and generate a ContextApp (from engine/Types.ts) One lib we could use to do that really fast is https://github.com/microsoft/typescript-go
[x] Update the engine shell to utilize a ContextApp
[x] Add a context:build command in the package.json that will trigger the analyzer and create a context.json file with the generated ContextApp. This file will be used by the engine to load the application context.
[ ] Read engine/docs/ui-refactor.md implement the refactor
