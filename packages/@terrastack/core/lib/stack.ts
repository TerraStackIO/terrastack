import { Construct, ISynthesisSession } from '@aws-cdk/core';
import * as fs from 'fs';
import * as path from 'path';
import { ResourceObject } from './resource-object';
import { resolve } from './_tokens';
import { removeEmpty } from './_util';
import { Names } from './names';
import {  
  snakeCase,
} from "./_util";


export class Stack extends Construct {

  /**
   * Finds the stack in which a node is defined.
   * @param node a construct node
   */
  public static of(node: Construct): Stack {
    if (node instanceof Stack) {
      return node;
    }

    const parent = node.node.scope as Construct;
    if (!parent) {
      throw new Error(`cannot find a parent chart (directly or indirectly)`);
    }

    return Stack.of(parent);
  }

  /**
   * The name of the stack's YAML file as emitted into the cloud assembly
   * directory during synthesis.
   */
  public readonly manifestFile: string;

  constructor(scope: Construct, ns: string) {
    super(scope, ns);
    this.manifestFile = `${this.node.uniqueId}.tf.json`;
  }

  /**
   * Generates a app-unique name for an object given it's construct node path.
   *
   * @param resourceObject The API object to generate a name for.
   */
  public generateObjectName(resourceObject: ResourceObject) {
    return Names.toDnsLabel(resourceObject.node.path);
  }

  protected synthesize(session: ISynthesisSession) {
    const doc: {[k: string]: {[k: string]: any}} = {};

    for (const resource of this.node.findAll()) {
      if (!(resource instanceof ResourceObject)) {
        continue;
      }
      const resourceName = snakeCase(resource.terraform.name)
      const type = snakeCase(resource.terraform.schemaType)
      

      if (!doc[type]) {
        const obj: {[k: string]: any} = {};
        doc[type] = obj
      }

      if (type === 'provider') {
        const manifest = removeEmpty(resolve(this, resource._render()));
        const merged = {...doc[type], ...manifest}
        doc[type] = merged
      } else {
        if (!doc[type][resourceName]) {
          const obj: {[k: string]: any} = {};
          doc[type][resourceName] = obj
        }
        
        const manifest = removeEmpty(resolve(this, resource._render()));
        const merged = {...doc[type][resourceName], ...manifest}
        doc[type][resourceName] = merged
      }
    }
    fs.writeFileSync(path.join(session.assembly.outdir, this.manifestFile), JSON.stringify(doc, null, 2));
  }
}