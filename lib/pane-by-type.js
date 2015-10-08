'use babel';

const path = require('path');

export default class PaneByType {

  static activate() {
    this.initiatePanes();

    atom.workspace.onDidOpen(event => {
      console.log('Did open');
      this.moveToCorrectPane(event.item, event.pane);
    });

    atom.workspace.observePanes(pane => {
      pane.onDidRemoveItem(event => {
        const item = event.item;
        console.log('Did remove', event.item);
        this.setPaneTypes(pane);
      });

      // pane.onDidAddItem(() => {
      //   console.log('Did add');
      //   this.setPaneTypes(pane);
      // });
    });
  }

  static initiatePanes() {
    const panes = atom.workspace.getPanes();
    for (let pane of panes) {
      this.setPaneTypes(pane);
    }
  }

  /**
   * Move item to the first pane that has a file with the same extension
   * @param  {object} item to move
   * @param  {Pane} pane current pane
   */
  static moveToCorrectPane(item, pane) {
    const ext = this.getFileExtension(item);
    console.log('Move', this.paneHasType(pane, ext));
    if (!this.paneHasType(pane, ext)) {
      const correctPane = this.getPaneWithType(ext);

      if (correctPane) {
        console.log('Correct pane');
        pane.moveItemToPane(item, correctPane);
        correctPane.activateItem(item);
      }
    }
  }

  /**
   * Set the type of file extensions a pane contains
   * @param {Pane} pane
   */
  static setPaneTypes(pane) {
    const items = pane.getItems();
    pane.paneByType = [];

    for (let item of items) {
      if (item.buffer && item.buffer.file) {
        const ext = path.extname(item.buffer.file.path);
        this.setPaneType(pane, ext);
      }
    }
  }

  /**
   * Add type to pane
   * @param {Pane} pane to add type to
   * @param {string} type
   */
  static setPaneType(pane, type) {
    if (!this.paneHasType(pane, type)) {
      pane.paneByType.push(type);
    }
  }

  /**
   * Returns the type of items the pane contains
   * @param  {Pane} pane
   * @return {array}      of types
   */
  static getPaneTypes(pane) {
    return pane.paneByType;
  }

  /**
   * Check to see if pane contains a specific type
   * @param  {Pane} pane
   * @param  {string} type
   * @return {boolean}
   */
  static paneHasType(pane, type) {
    const types = this.getPaneTypes(pane);
    if (types.indexOf(type) < 0) {
      return false;
    }

    return true;
  }

  /**
   * Get extension of file
   * @param  {object} item
   * @return {string}
   */
  static getFileExtension(item) {
    if (item.buffer && item.buffer.file) {
      return path.extname(item.buffer.file.path);
    }

    return false;
  }

  /**
   * Get the pane that holds a certain type
   * @param  {string} type
   * @return {Pane}
   */
  static getPaneWithType(type) {
    console.log('Get pane with type');
    const panes = atom.workspace.getPanes();
    for (let pane of panes) {
      console.log(this.paneHasType(pane, type));
      if (this.paneHasType(pane, type)) {
        return pane;
      }
    }
  }

  static deactivate() {
  }
}
