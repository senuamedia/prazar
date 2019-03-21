/*
    Basic form
*/
var disableSubmit = false

document.getElementById("form").addEventListener("submit", function(e) {
  if (disableSubmit) {
    e.preventDefault()
    disableSubmit = false
    return false
  }

  // rest of send stuff

});

/*
  Tag script
*/
(function() {
  'use-strict'

  var toView = document.getElementById("tagContainer")
  var toServer = document.getElementById("tagArray")
  var transientTagField = document.getElementById("transientTagField")
  var validate = document.getElementById("validate")
  var dragSrcEl = null
  var tags = []

  function input(ignoreComma) {

    if (!/^([a-zA-Z0-9\.\-+]{2,20},?)+$/g.test(this.value)) {
      disableSubmit = true
      if (typeof this.willValidate !== "undefined") validate.click()
      else alert("Min: 2 Chars and [a-z,+,-] (and update your goddman browser)")

      return
    }

    if (this.value.indexOf(",") != -1 || ignoreComma) {
      if (this.value.substring(this.value.length - 1) === ',') this.value = this.value.substring(0, this.value.length - 1)

      var newTags = this.value.split(",")
      for (var i = 0, newTag = newTags[0]; newTag = newTags[i]; i++) {
        if (tags.indexOf(newTag) === -1) tags.push(newTag)
      }

      this.value = ""
      render()

    }
  }

  transientTagField.addEventListener("input", function(e) {
    input.call(this, false)
  })

  transientTagField.addEventListener("keypress", function(e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      input.call(this, true)
    }
  })

  function render() {
    var childs = toView.childNodes
    for (var i = 0; i < tags.length; i++) {
      if (childs[i]) {
        childs[i].childNodes[0].nodeValue = tags[i];
        childs[i].classList.remove('delete')
      } else appendNewTag(tags[i])

    }

    for (; i < childs.length; i++) toView.removeChild(childs[i])

    toServer.value = tags

  }

  function toggleRemoveTag() {
    if (!this.classList.contains('delete')) this.classList.add('delete')
    else this.classList.remove('delete')
  }

  function removeTag() {
    tags.splice(tags.indexOf(this.parentNode.childNodes[0].nodeValue), 1)
    render()

  }

  /*
  drag and drop
  */

  function handleDragStart(e) {
    this.style.opacity = '0.4'
    this.classList.remove('delete')
    dragSrcEl = this

    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnter(e) {
    this.classList.add('over')
  }

  function handleDragLeave(e) {
    this.classList.remove('over')
  }

  function handleDragEnd(e) {
    this.style.opacity = '1'
  }

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation()

    if (dragSrcEl != this) {
      var indexTwo = tags.indexOf(this.childNodes[0].nodeValue)
      tags[tags.indexOf(dragSrcEl.childNodes[0].nodeValue)] = this.childNodes[0].nodeValue
      tags[indexTwo] = dragSrcEl.childNodes[0].nodeValue

      render()
    }

    this.classList.remove('over')

  }

  function appendNewTag(name) {

    var para = document.createElement("span")
    para.className = "tag"
    para.draggable = true

    para.addEventListener("click", toggleRemoveTag)
    para.addEventListener("dragstart", handleDragStart)
    para.addEventListener("dragenter", handleDragEnter)
    para.addEventListener("dragleave", handleDragLeave)
    para.addEventListener("dragover", handleDragOver)
    para.addEventListener("dragend", handleDragEnd)
    para.addEventListener("drop", handleDrop)

    para.appendChild(document.createTextNode(name))

    var remove = document.createElement("span")
    remove.appendChild(document.createTextNode('✖'))
    remove.className = "remove"
    remove.addEventListener("click", removeTag)
    para.appendChild(remove)

    toView.appendChild(para)

  }

  /*
  Init
  */

  if (toServer.value && toServer.value.length > 0) {
    var newTags = toServer.value.split(",")
    for (var i = 0, newTag = newTags[0]; newTag = newTags[i]; i++) {
      if (tags.indexOf(newTag) === -1) tags.push(newTag)
      render()
    }
  }

}())