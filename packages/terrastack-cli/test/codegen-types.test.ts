import { TypeGenerator } from "../lib/codegen-types";
import { promises as fs } from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { CodeMaker } from "codemaker";
import { JSONSchema4 } from "json-schema";

jest.setTimeout(60000); // 1min

describe('structs', () => {  
  resource('has primitive types', {
    version: 0,
    block: {
      attributes: {
        string: {
          type: "string"
        },
        bool: {
          type: "bool"
        },
        number: {
          type: "number"
        },
      }
    }
  });

  resource('has primitive optional types', {
    version: 0,
    block: {
      attributes: {
        architecture: {
          type: "string",
          optional: true
        }        
      }
    }
  });

  resource('has primitive optional computed type', {
    version: 0,
    block: {
      attributes: {
        architecture: {
          type: "string",
          optional: true,
          computed: true
        }        
      }
    }
  });

  resource('has primitive computed type', {
    version: 0,
    block: {
      attributes: {
        architecture: {
          type: "string",          
          computed: true
        }        
      }
    }
  });

  resource('has an optional map of strings', {
    version: 0,
    block: {
      attributes: {
        tags: {
          type: ["map", "string"],
          optional: true
        },
        bool: {
          type: ["map", "bool"]
        },
        number: {
          type: ["map", "number"]
        },
        numberSet: {
          type: ["set", "number"]
        }
      }
    }
  });

  resource('has list of complex nested objects', {
    version: 0,
    block: {
      attributes: {
        instance_market_options: {
          type: ["list", ["object", {
            market_type: "string",
            spot_options: ["set", ["object", {
              block_duration_minutes: "number"
            }]]
          }]],
          optional: true
        }        
      }
    }
  });

  resource('has block type nested as single', {
    version: 0,
    block: {
      attributes: {
        tags: {
          type: ["map", "string"],
          optional: true
        }        
      },
      block_types: {
        s3_import: {
          nesting_mode: "single",
          block: {
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

  resource('has empty block type nested as single', {
    version: 0,
    block: {
      attributes: {
        tags: {
          type: ["map", "string"],
          optional: true
        }        
      },
      block_types: {
        s3_import: {
          nesting_mode: "single",
          block: {
            attributes: {}
          }  
        }
      }
    }
  });

  resource('has block type nested in block type', {
    version: 0,
    block: {
      attributes: {
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

function resource(name: string, schema: JSONSchema4) {
  which('resource', name, schema)
}


function which(type: string, name: string, schema: JSONSchema4) {
  test(name, async () => {
    const gen = new TypeGenerator(type);
    gen.addType('TestType', schema);

    await withTempDir('test', async () => {
      expect(await generate(gen)).toMatchSnapshot();
    });
  });
}

async function generate(gen: TypeGenerator) {
  const code = new CodeMaker();

  const entrypoint = 'index.ts';

  code.openFile(entrypoint);
  gen.generate(code);
  code.closeFile(entrypoint)
  await code.save('.');

  const source = await fs.readFile(path.join('.', entrypoint), 'utf-8');

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