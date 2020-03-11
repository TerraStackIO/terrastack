import * as yargs from 'yargs';
import { generateAllApiObjects } from '../../lib/import';

class Command implements yargs.CommandModule {
  public readonly command = 'generate';
  public readonly describe = 'Generates typed constructs for Terraform resources';
  public readonly aliases = [ 'gen', 'import' ];

  public readonly builder = (args: yargs.Argv) => args    
    .option('output', { type: 'string' as 'string', desc: 'output directory', default: '.generated', alias: 'o' })
    .option('input', { type: 'string' as 'string', desc: 'schema input file', alias: 'i' });

  public async handler(argv: any) {
    await generateAllApiObjects(argv.output, argv.input);
  }
}

module.exports = new Command();
