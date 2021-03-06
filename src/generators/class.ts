import * as d from 'debug';
import * as path from 'path';
import TsHelper from '../';
import * as utils from '../utils';
const debug = d('egg-ts-helper#generators_class');

export default function(tsHelper: TsHelper) {
  tsHelper.register('class', (config, baseConfig) => {
    const fileList = config.fileList;
    const dist = path.resolve(config.dtsDir, 'index.d.ts');

    debug('file list : %o', fileList);
    if (!fileList.length) {
      return { dist };
    }

    // using to compose import code
    let importStr = '';
    // using to create interface mapping
    const interfaceMap: PlainObject = {};

    fileList.forEach(f => {
      f = f.substring(0, f.lastIndexOf('.'));
      const obj = utils.getModuleObjByPath(f);
      const tsPath = path
        .relative(config.dtsDir, path.join(config.dir, f))
        .replace(/\/|\\/g, '/');
      debug('import %s from %s', obj.moduleName, tsPath);
      importStr += `import ${obj.moduleName} from '${tsPath}';\n`;

      // create mapping
      let collector = interfaceMap;
      while (obj.props.length) {
        const name = utils.camelProp(
          obj.props.shift() as string,
          config.caseStyle || baseConfig.caseStyle,
        );

        if (!obj.props.length) {
          collector[name] = obj.moduleName;
        } else {
          collector = collector[name] = collector[name] || {};
        }
      }
    });

    // composing all the interface
    const composeInterface = (
      obj: PlainObject,
      indent: string = '',
    ): string => {
      let str = '';

      Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (typeof val === 'string') {
          str += `${indent + key}: ${
            config.interfaceHandle ? config.interfaceHandle(val) : val
          };\n`;
        } else {
          const newVal = composeInterface(val, indent + '  ');
          if (newVal) {
            str += `${indent + key}: {\n${newVal + indent}};\n`;
          }
        }
      });

      return str;
    };

    return {
      dist,
      content:
        `${importStr}\n` +
        `declare module '${config.framework || baseConfig.framework}' {\n` +
        `  interface ${config.interface} {\n` +
        composeInterface(interfaceMap, '    ') +
        '  }\n' +
        '}\n',
    };
  });
}
