describe('CTS', function() {
  const assert = chai.assert;
  const nn = navigator.ml.getNeuralNetworkContext();

  it('check result for Depthwise conv2d float example', async function() {
    let model = await nn.createModel(options);
    let operandIndex = 0;

    let op1_value = [10, 21, 10, 22, 10, 23, 10, 24, 10, 25, 10, 26, 10, 27, 10, 28, 10, 29];
    let op4_expect = [11, 3, 7.2, 10.6, 11, 3, 7.4, 10.9, 11, 3, 7.8, 11.5, 11, 3, 8.0, 11.8];

    let type3 = {type: nn.INT32};
    let type1 = {type: nn.TENSOR_FLOAT32, dimensions: [1, 2, 2, 4]};
    let type1_length = product(type1.dimensions);
    let type0 = {type: nn.TENSOR_FLOAT32, dimensions: [1, 3, 3, 2]};
    let type0_length = product(type0.dimensions);
    let type2 = {type: nn.TENSOR_FLOAT32, dimensions: [4]};
    let type2_length = product(type2.dimensions);

    let op1 = operandIndex++;
    model.addOperand(type0);
    let op2 = operandIndex++;
    model.addOperand(type1);
    let op3 = operandIndex++;
    model.addOperand(type2);
    let pad0 = operandIndex++;
    model.addOperand(type3);
    let act = operandIndex++;
    model.addOperand(type3);
    let stride = operandIndex++;
    model.addOperand(type3);
    let channelMultiplier = operandIndex++;
    model.addOperand(type3);
    let op4 = operandIndex++;
    model.addOperand(type1);

    model.setOperandValue(op2, new Float32Array([0.25, 0, 0.2, 0, 0.25, 0, 0, 0.3, 0.25, 0, 0, 0, 0.25, 0.1, 0, 0]));
    model.setOperandValue(op3, new Float32Array([1, 2, 3, 4]));
    model.setOperandValue(pad0, new Int32Array([0]));
    model.setOperandValue(act, new Int32Array([0]));
    model.setOperandValue(stride, new Int32Array([1]));
    model.setOperandValue(channelMultiplier, new Int32Array([2]));
    model.addOperation(nn.DEPTHWISE_CONV_2D, [op1, op2, op3, pad0, pad0, pad0, pad0, stride, stride, channelMultiplier, act], [op4]);

    model.identifyInputsAndOutputs([op1], [op4]);
    await model.finish();

    let compilation = await model.createCompilation();
    compilation.setPreference(getPreferenceCode(options.prefer));
    await compilation.finish();

    let execution = await compilation.createExecution();

    let op1_input = new Float32Array(op1_value);
    execution.setInput(0, op1_input);

    let op4_output = new Float32Array(type1_length);
    execution.setOutput(0, op4_output);

    await execution.startCompute();

    for (let i = 0; i < type1_length; ++i) {
      assert.isTrue(almostEqualCTS(op4_output[i], op4_expect[i]));
    }
  });
});
