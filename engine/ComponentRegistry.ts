/**
 * Component Registry
 * Dynamically loads and provides access to components from the example app
 */

import type { ComponentType } from 'react';

// Import all components from the example app
// NOTE: We don't import App because it imports global CSS (index.css) that conflicts with the engine UI
import MainPage from '../example/components/MainPage';
import Nav from '../example/components/Nav';
import { FormPage } from '../example/components/FormPage';
import { ProductPage } from '../example/components/ProductPage';
import { ContactPage } from '../example/components/ContactPage';

export interface ComponentRegistryEntry {
    component: ComponentType<any>;
    name: string;
    path: string;
}

class ComponentRegistry {
    private components: Map<string, ComponentRegistryEntry> = new Map();

    constructor() {
        this.registerComponents();
    }

    private registerComponents() {
        // Register all available components with their paths (IDs must match context.json)
        // NOTE: App is not registered because it imports global CSS that breaks the engine UI
        this.register('MainPage_8d726082', MainPage, 'MainPage', '/home/fbi/repo/js/context/example/components/MainPage.tsx');
        this.register('Nav_17ef6e35', Nav, 'Nav', '/home/fbi/repo/js/context/example/components/Nav.tsx');
        this.register('FormPage_6eb2685e', FormPage, 'FormPage', '/home/fbi/repo/js/context/example/components/FormPage.tsx');
        this.register('ProductPage_b3df1d9b', ProductPage, 'ProductPage', '/home/fbi/repo/js/context/example/components/ProductPage.tsx');
        this.register('ContactPage_5370d52b', ContactPage, 'ContactPage', '/home/fbi/repo/js/context/example/components/ContactPage.tsx');
    }

    private register(id: string, component: ComponentType<any>, name: string, path: string) {
        this.components.set(id, { component, name, path });
    }

    getComponent(id: string): ComponentRegistryEntry | undefined {
        return this.components.get(id);
    }

    getAllComponents(): Map<string, ComponentRegistryEntry> {
        return this.components;
    }
}

export const componentRegistry = new ComponentRegistry();
