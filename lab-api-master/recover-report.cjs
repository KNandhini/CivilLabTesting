const fs=require('fs'),ts=require('./node_modules/typescript');
const sourcePath='src/reports/generate-report.ts';
const damaged=fs.readFileSync(sourcePath,'utf8');
const prefix=damaged.slice(0,damaged.indexOf('function drawCheckbox('));
fs.writeFileSync('artifacts/report-layout/generate-report.truncated.ts',damaged);
const recovered=fs.readFileSync('artifacts/report-layout/recovered-report-module.js','utf8');
const ast=ts.createSourceFile('recovered.ts',recovered,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const aliases={pdfkit_1:{default:'PDFDocument'},path_1:{default:'path'},configuration_json_1:{default:'configuration'},images_1:{images:'images'},observation_value_1:{formatObservationValue:'formatObservationValue'},observation_average_1:{calculateObservationAverageRow:'calculateObservationAverageRow',calculateEntryPageAverageRow:'calculateEntryPageAverageRow'}};
const publicFunctions=new Set(['generateReport','ContractReviewForm','TestReportPage']);
const transform=context=>{
 const visit=node=>{
  if(ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)&&aliases[node.expression.text]?.[node.name.text])return ts.factory.createIdentifier(aliases[node.expression.text][node.name.text]);
  if(ts.isParenthesizedExpression(node)&&ts.isBinaryExpression(node.expression)&&node.expression.operatorToken.kind===ts.SyntaxKind.CommaToken&&node.expression.left.getText(ast)==='0')return ts.visitNode(node.expression.right,visit);
  if(ts.isParameter(node)&&!node.type)return ts.factory.updateParameterDeclaration(node,node.modifiers,node.dotDotDotToken,node.name,node.questionToken,ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),node.initializer&&ts.visitNode(node.initializer,visit));
  if(ts.isVariableDeclaration(node)&&node.initializer&&(ts.isArrayLiteralExpression(node.initializer)&&node.initializer.elements.length===0||ts.isObjectLiteralExpression(node.initializer)&&node.initializer.properties.length===0))return ts.factory.updateVariableDeclaration(node,node.name,node.exclamationToken,ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),ts.visitNode(node.initializer,visit));
  if(ts.isFunctionDeclaration(node)&&node.name&&publicFunctions.has(node.name.text))return ts.factory.updateFunctionDeclaration(node,[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),...(node.modifiers||[])],node.asteriskToken,node.name,node.typeParameters,node.parameters.map(p=>ts.visitNode(p,visit)),node.type,node.body&&ts.visitNode(node.body,visit));
  return ts.visitEachChild(node,visit,context);
 };return root=>ts.visitNode(root,visit);
};
const funcs=ast.statements.filter(ts.isFunctionDeclaration);
const transformed=ts.transform(ts.factory.updateSourceFile(ast,funcs),[transform]);
const printed=ts.createPrinter().printFile(transformed.transformed[0]);
const result=prefix+printed+'\nexport interface TestReportPageData { reportDate: string; testReportNo: string; ulrNo: string; }\n';
if(!result.includes('export async function TestReportPage')||!result.includes('function drawSimpleTable'))throw Error('Incomplete recovery');
const temp=sourcePath+'.recovered';fs.writeFileSync(temp,result);fs.renameSync(temp,sourcePath);
console.log('Recovered all report functions from the deployed module; preserved existing imports and data interfaces.');