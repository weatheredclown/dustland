(function(){
  function Wizard(config){
    this.title = config.title || 'Wizard';
    this.steps = config.steps || [];
    this.state = {};
    this.current = 0;
    this.onComplete = null;
  }

  Wizard.prototype.render = function(container){
    this.container = container || document.body;
    const wrap = document.createElement('div');
    wrap.className = 'wizard';
    const titleEl = document.createElement('h2');
    titleEl.textContent = this.title;
    wrap.appendChild(titleEl);
    this.stepEl = document.createElement('div');
    wrap.appendChild(this.stepEl);
    const nav = document.createElement('div');
    const back = document.createElement('button'); back.textContent = 'Back';
    const next = document.createElement('button'); next.textContent = 'Next';
    nav.appendChild(back); nav.appendChild(next);
    wrap.appendChild(nav);
    back.onclick = () => { if (this.current > 0){ this.current--; this.showStep(); } };
    next.onclick = () => {
      if (this.current < this.steps.length - 1){
        this.current++;
        this.showStep();
      } else {
        this.onComplete && this.onComplete(this.state);
      }
    };
    this.container.appendChild(wrap);
    this.wrap = wrap;
    this.showStep();
  };

  Wizard.prototype.showStep = function(){
    const step = this.steps[this.current];
    this.stepEl.innerHTML = '';
    if (step && typeof step.render === 'function'){
      step.render(this.stepEl, this.state);
    }
  };

  Wizard.prototype.getState = function(){ return this.state; };
  Wizard.prototype.setState = function(part){ Object.assign(this.state, part || {}); };

  function TextInputStep(opts){
    this.id = opts.id;
    this.label = opts.label || opts.id;
  }

  TextInputStep.prototype.render = function(el, state){
    const label = document.createElement('label');
    label.textContent = this.label;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = state[this.id] || '';
    input.oninput = () => { state[this.id] = input.value; };
    label.appendChild(input);
    el.appendChild(label);
  };

  function AssetPickerStep(opts){
    this.id = opts.id;
    this.label = opts.label || opts.id;
    this.assets = opts.assets || [];
  }

  AssetPickerStep.prototype.render = function(el, state){
    const label = document.createElement('label');
    label.textContent = this.label;
    const select = document.createElement('select');
    for (const a of this.assets){
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      select.appendChild(opt);
    }
    select.onchange = () => { state[this.id] = select.value; };
    label.appendChild(select);
    el.appendChild(label);
  };

  globalThis.Wizard = Wizard;
  globalThis.TextInputStep = TextInputStep;
  globalThis.AssetPickerStep = AssetPickerStep;
})();

