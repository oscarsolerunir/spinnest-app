import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`

export const Label = styled.label`
  font-weight: bold;
`

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
`

export const Button = styled.button`
  padding: 0.5rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
`

export const ImagePreview = styled.img`
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
  border-radius: 5px;
`
