import { JSONSchema4 } from "json-schema";
import { CodeMaker } from "codemaker";
import {  
  camelCase,
  pascalCase
} from "change-case";

export interface ResolvedTypes {
  type: string;
  assignable: boolean;
  optional: boolean;
  referencable: boolean;
}

function generatePropertyName(property: string): string {
  // `self` doesn't work in as property name in Python
  if (property === 'self') {    
    return camelCase(`${property}Property`)
  }
  // jsii can't handle `getFoo` properties, since it's incompatible with Java
  if (property.split('_')[0] === 'get') {    
    return camelCase(property.replace('get', 'fetch'))
  }
  return camelCase(property)
}


export class TypeGenerator {
  private readonly emitted = new Set<string>();
  public readonly types: {[key: string]: {[key: string]: ResolvedTypes}} = { };

  constructor(private readonly type: string) {
  }

  public addType(typeName: string, def: JSONSchema4) {    
    if (this.emitted.has(typeName)) {
      console.log('hier')
      return;
    }
    this.resolveTypes(typeName, def.block || def);    
  }

  public generate(code: CodeMaker) {
    for (const type of Object.keys(this.types)) {
      const spec = this.types[type];
      this.emitStruct(code, type, spec)
      code.line();
      this.emitted.add(type);
    }    
  }

  private resolveTypes(typeName: string, def: JSONSchema4) {
    const self = this;
    if (def.attributes || def.block_types) {
      for (const [ propName, propSpec ] of Object.entries(def.attributes || {})) {
        resolveProperty(propName, propSpec as JSONSchema4);
      }

      for (const [ blockName, blockSpec ] of Object.entries(def.block_types || {})) {
        const newTypeName = `${typeName}${pascalCase(blockName)}Props`
        self.addType(newTypeName, blockSpec as JSONSchema4)
        const emptyType = (Object.keys((blockSpec as JSONSchema4).block.attributes || {}).length === 0)
        addProperty(blockName, emptyType ? 'any' : newTypeName, true, true, false)
      }
    } else {
      for (const [ propName, propSpec ] of Object.entries(def || {})) {
        resolveProperty(propName, propSpec as JSONSchema4);
      }
    }

    function resolveProperty(name: string, def: JSONSchema4) {
      let assignable = true      
      if ((def.computed && !def.optional) || (self.type !== 'data' && name === 'id')) {
        assignable = false
      }
      const propertyType = self.typeForProperty(def, name, typeName);
      const optional = (def.optional || def.computed)
      addProperty(name, propertyType, assignable, optional, def.computed)
    }  

    function addProperty(name: string, propertyType: string, assignable: boolean, optional: boolean, referencable: boolean) {
      if (!self.types[typeName]) {
        self.types[typeName] = {}
      }

      self.types[typeName][name] = {
        type: propertyType,
        assignable,
        optional,
        referencable
      }
    }
  }

  private emitStruct(code: CodeMaker, typeName: string, def: {[key: string]: ResolvedTypes}) {
    code.openBlock(`export interface ${typeName}`);
    for (const propertyName of Object.keys(def)) {
      const property = def[propertyName]
      if (!property.assignable) continue;
      code.line(`readonly ${generatePropertyName(propertyName)}${property.optional ? '?' : ''}: ${property.type};`);
      code.line();
    }
    
    code.closeBlock();
  }

  private typeForProperty(def: JSONSchema4, name: string, typeName: string): string {  
    const comparable = def.type || def
    switch (true) {
      case (comparable === "string"): return 'string';
      case (comparable === "number"): return 'number';
      case (comparable === "integer"): return 'number';
      case (comparable?.toString() === "bool"): return 'boolean';
      case (Array.isArray(comparable)): return this.handleArrayType(comparable as JSONSchema4, name, typeName);
      default: 
        console.log({typeForProperty: def, name, typeName, comparable})
        return 'any';
    }
  }

  private handleArrayType(def: JSONSchema4, name: string, typeName: string): string {
    const element = ((def.type || def) as Array<any>)
    if (Array.isArray(element[element.length - 1])) {
      const type = element[0]
      const obj = element[element.length - 1]
      let newTypeName = undefined;
      if (this.jsonEqual(obj, ["map", "string"])) {
        newTypeName = `{[key: string]: string}`
      } else {
        newTypeName = `${typeName}${pascalCase(name)}Props`  
        this.addType(newTypeName, obj[obj.length - 1] as JSONSchema4)  
      }
      switch(type) {
        case 'list': return `${newTypeName}[]`;
        case 'set': return `${newTypeName}[]`;
      }    
    }
    switch (true) {
      case (this.jsonEqual(element, ["map", "string"])): return '{[k:string]: string}';
      case (this.jsonEqual(element, ["map", "bool"])): return '{[k:string]: boolean}';
      case (this.jsonEqual(element, ["map", "number"])): return '{[k:string]: number}';
      case (this.jsonEqual(element, ["set", "number"])): return 'number[]';
      case (this.jsonEqual(element, ["set", "string"])): return 'string[]';
      case (this.jsonEqual(element, ["list", "string"])): return 'string[]';      
      default: 
        console.log({handleArrayType: def, name, typeName})
        return 'any';
    }
  }

  private jsonEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}