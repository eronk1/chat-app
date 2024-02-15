import React from 'react'

export default function ErrorPage() {
  let errorStyle = {
    margin: "auto",
    color: "red",
    textAlign: "center",
    height: "100vh",
    display: "grid",
    placeContent: "center",
    fontSize: "2rem"
  }
  return (
    <div style={errorStyle} id='errorParent'>Page does not exist</div>
  )
}
