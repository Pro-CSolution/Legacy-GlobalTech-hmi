import styled from 'styled-components'

export const Area = styled.svg<{ $startDegres?: number }>`
  position: absolute;
  height: 100%;
  width: 100%;
  transform: ${({ $startDegres }) => `rotate(${$startDegres}deg)`};
  border-radius: 50%;
  transition: all 250ms ease-in;

  circle {
    fill: none;
    stroke-width: 4.5%;
    stroke-dashoffset: 300%;
    stroke-linecap: butt;
  }
`
