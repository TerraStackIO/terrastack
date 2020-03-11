import { emitConstructForApiObject } from "../lib/codegen-constructs";
import { promises as fs } from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { CodeMaker } from "codemaker";
import { JSONSchema4 } from "json-schema";

jest.setTimeout(60000); // 1min

describe('construct', () => {  
  construct('generate complex construct', {
    name: 'aws_foo_resource',
    version: 0,
    block: {
      attributes: {
        arn: {
          type: "string",
          computed: true
        },
        tags: {
          type: ["map", "string"],
          optional: true
        }        
      },
      block_types: {
        s3_import: {
          nesting_mode: "single",
          block: {
            block_types: {
              foo: {
                nesting_mode: "single",
                block: {
                  attributes: {
                    bar: {
                      type: "string",
                      optional: true
                    }
                  }
                }  
              }
            },
            attributes: {
              create: {
                type: "string",
                optional: true
              }
            }
          }  
        }
      }
    }
  });
});

function construct(name: string, schema: JSONSchema4) {
  which('resource_schemas', name, schema)
}


function which(type: string, name: string, schema: JSONSchema4) {
  test(name, async () => {
    const code = new CodeMaker();
    const filePath = emitConstructForApiObject(code, schema, 'aws', type, '2.5.2')
    await withTempDir('test', async () => {
      expect(await generate(code, filePath)).toMatchSnapshot();
    });
  });
}

async function generate(code: CodeMaker, filePath: string) {
  await code.save('.');
  const source = await fs.readFile(path.join('.', `${filePath}.ts`), 'utf-8');
  return source;
}

async function withTempDir(dirname: string, closure: () => Promise<void>) {
  const prevdir = process.cwd();
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'terrastack.'));
  const workdir = path.join(parent, dirname);
  await fse.mkdirp(workdir);
  try {
    process.chdir(workdir);
    await closure();
  } finally {
    process.chdir(prevdir);
    await fse.remove(parent);
  }
}