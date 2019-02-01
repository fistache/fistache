import { TagAttrib } from '@seafood/compiler'

export enum FunctionKeyword {
    Element =  '_e',
    Component = '_c',
    EmbeddedContent = '_k',
    Text = '_t',
    Include = '_i'
}

export enum AttributeKeyword {
    Special,
    Static,
    Dynamic,
    Injection,
    Event
}

export interface ComponentAttributes {
    [AttributeKeyword.Special]: TagAttrib[]
    [AttributeKeyword.Static]: TagAttrib[]
    [AttributeKeyword.Dynamic]: TagAttrib[]
    [AttributeKeyword.Injection]: TagAttrib[]
    [AttributeKeyword.Event]: TagAttrib[]
}
