// Used to represent translation for multiple languages
export interface Translation {
  key: string;
  enValue: string;
  frValue: string;
}

export interface Prop {
  name: string;
  type: string;
}

export interface Hook {
  name: string;
  type: string;
}

export interface Preset {
  name: string;
  props: Prop[];
  hooks: Hook[];
}

export interface Component {
  id: string;
  path: string;
  name: string;
  props: Prop[];
  hooks: Hook[];
  translations: string[];  // Translation keys used by this component
  childrenIds: string[];   // IDs of child components
  parentIds: string[];     // IDs of parent components (can have multiple)
}

export interface ContextApp {
  name: string;
  components: Record<string, Component>;  // componentId -> Component
  rootComponents: string[];  // IDs of root components
  translations: Record<string, string[]>;  // translationKey -> componentIds
}
