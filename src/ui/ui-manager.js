export class UIManager {
  constructor(effects, eventBus) {
      this.effects = effects;
      this.categories = [...new Set(Object.values(effects).map(a => a.category))];
      this.eventBus = eventBus;
  }

  generateEffectToolbarUI() {
    // toolbar containing category tabs
		let categoryToolbar = document.getElementsByClassName('category-toolbar')[0];
    // panel containing effect buttons
		let effectToolbar = document.getElementsByClassName('effect-toolbar')[0];

    if(this.categories) {
      this.categories.forEach((c) => {
        // Create a tab (button) for the category and add it to the toolbar
        let categoryTab = this.createButton(c, c, ['category-tab']);
        categoryToolbar.appendChild(categoryTab);
        
        // Create a div to hold the buttons that belong to this category. Hide all to start
        let effectButtonBar = this.createDiv(c + '-buttons', [c + '-buttons', 'effect-button-bar']);
        effectToolbar.appendChild(effectButtonBar);
        effectButtonBar.classList.add('hidden');

        // Create effect buttons and add them to their category div
        let effectsInCategory = Object.values(this.effects).filter(effect => effect.category === c);
        // let effectNames = effectsInCategory.map(a => a.name);
        if(effectsInCategory) {
          effectsInCategory.forEach(effect => {
            let name = effect.name;
            let tag = effect.tag;
            let effectButton = this.createButton(name, name + '-button', ['effect-button']); 
            effectButtonBar.appendChild(effectButton);
            effectButton.addEventListener('click', (event) => {
              this.setActiveEffectButton(effectButton.id); // when effect button clicked, select it and deselect all others
              //this.updateCursor(this.effects[name].cursor); //TODO
            });
          });
        }
        
        categoryTab.addEventListener("click", (e) => {
          this.setActiveCategoryTab(e.target.id);
        });
        this.setDefaultEffectAndCategory();
      });
    }
  }

  _getEffectType(effectName) {
    let effect = this.effects[effectName];
    return effect.tag + "/" + effect.name;
  }

  setActiveEffectButton(id) {
    this.markAsSelected("effect-button", id);
    this.eventBus.dispatchEvent(new CustomEvent('effectSelected', { detail: { effectType: this._getEffectType(id.split('-')[0]) } }));
  }

  // mark category selected and show its tab and corresponding effect buttons
  setActiveCategoryTab(id) {
    this.markAsSelected("category-tab", id); // select the clicked tab and deselect all others
    document.querySelectorAll('.effect-button-bar').forEach(e => { // hide all effect button bars
      e.classList.add('hidden');
    });
    let effectButtonBar = document.getElementById(id + '-buttons'); // get this category's effect button bar
    effectButtonBar.classList.remove('hidden'); // show the button bar
    this.setActiveEffectButton(effectButtonBar.firstChild.id); // select first button in this category by default
  }

  setDefaultEffectAndCategory() {
    let firstCategory = document.querySelector('.category-tab');
    if(firstCategory) {
     this.setActiveCategoryTab(firstCategory.id);
    }
  }

  markAsSelected(className, id) {
    // console.log("marking as selected", className, id);
    // Deselect all elements with the specified class name
    document.querySelectorAll("."+className).forEach(e => {
      e.classList.remove('selected');
    });
    // Select the element with the specified ID
    const elementToSelect = document.getElementById(id);
    if (elementToSelect) {
        elementToSelect.classList.add('selected');
    }
  }

  getSelectedEffect() {
		let selectedEffects = document.querySelectorAll('.effect-button.selected:not(.hidden)')
		if(selectedEffects.length > 0) {
		  let selectedEffect = selectedEffects[0];
		  return selectedEffect.value;
		} else return "";
	}

  createButton(name, id, classNames) {
    let b = document.createElement("input");
    b.setAttribute("type", "button");
    classNames.forEach((className) => {
      b.classList.add(className);
    });
    b.setAttribute("value", name);
    b.setAttribute("id", id);
    return b;
  }

  createDiv(id, classNames) {
    let div = document.createElement("div");
    classNames.forEach((className) => {
      div.classList.add(className);
    });
    div.setAttribute("id", id);
    return div;
  }
}