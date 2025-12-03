export const scaleNumber = (
  inputNumber: number,
  minValue = 0,
  maxValue = 100,
  minOutput = -120,
  maxOutput = 120
) => {
  if (inputNumber <= minValue) return minOutput
  else if (inputNumber >= maxValue) return maxOutput

  const adjustedInput = inputNumber - minValue
  const inputRange = maxValue - minValue
  const outputRange = maxOutput - minOutput

  const outputNumber = minOutput + (adjustedInput / inputRange) * outputRange

  return outputNumber
}
