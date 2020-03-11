import { Construct, ConstructNode } from '@aws-cdk/core';
import * as fs from 'fs';
import * as path from 'path';

export interface AppOptions {
  /**
   * The directory to output Terraform files.
   * 
   * @default "dist"
   */
  readonly outdir?: string;
}

/**
 * Represents a Terrastack application.
 */
export class App extends Construct {
  /**
   * The output directory into which manifests will be synthesized.
   */
  public readonly outdir: string;

  /**
   * Defines an app
   * @param options configuration options
   */
  constructor(options: AppOptions = { }) {
    super(undefined as any, '');
    this.outdir = options.outdir ?? 'dist';
  }

  /**
   * Synthesizes all manifests to the output directory
   */
  public synth(): void {
    ConstructNode.synth(this.node, {
      outdir: this.outdir
    });

    // remove manifest.json and cdk.out
    rm(path.join(this.outdir, 'manifest.json'));
    rm(path.join(this.outdir, 'cdk.out'));
  }
}

function rm(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}