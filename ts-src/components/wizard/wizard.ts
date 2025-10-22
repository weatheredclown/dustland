// @ts-nocheck
(function(){
  function Wizard(container, steps, opts = {}){
    let index = 0;
    const state = opts.initialState || {};
    const onComplete = opts.onComplete || function(){};

    function render(){
      container.innerHTML = '';
      const step = steps[index];
      step?.render(container, state);
    }

    function next(){
      const step = steps[index];
      if(step?.validate && step.validate(state) === false) return false;
      step?.onComplete?.(state);
      index++;
      if(index >= steps.length){
        onComplete(state);
        return true;
      }
      render();
      return true;
    }

    function prev(){
      if(index === 0) return false;
      index--;
      render();
      return true;
    }

    function goTo(i){
      if(i < 0 || i >= steps.length) return false;
      index = i;
      render();
      return true;
    }

    function getState(){
      return state;
    }

    function current(){
      return index;
    }

    render();
    return { next, prev, goTo, getState, current };
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.Wizard = Wizard;
})();
