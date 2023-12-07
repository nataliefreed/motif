<script lang="ts">
  import Toolbar from './Toolbar.svelte';
  import CodeEffectButton from './CodeEffectButton.svelte';
  import Icon from 'svelte-awesome';
  import beer from 'svelte-awesome/icons/beer';
  import eyedropper from 'svelte-awesome/icons/eyedropper';
  import paintBrush from 'svelte-awesome/icons/paintBrush';
  import eye from 'svelte-awesome/icons/eye';
  import eyeSlash from 'svelte-awesome/icons/eyeSlash';
  import random from 'svelte-awesome/icons/random';
  import repeat from 'svelte-awesome/icons/repeat';

  import save from 'svelte-awesome/icons/save';
  import gift from 'svelte-awesome/icons/gift';
  import trash from 'svelte-awesome/icons/trash';
  import envelopeO from 'svelte-awesome/icons/envelopeO';
  import heart from 'svelte-awesome/icons/heart';
  import thList from 'svelte-awesome/icons/thList';
  import listAlt from 'svelte-awesome/icons/listAlt';
  import lock from 'svelte-awesome/icons/lock';
  import mousePointer from 'svelte-awesome/icons/mousePointer';
  import indent from 'svelte-awesome/icons/indent';
  // import { dicethree } from '@fortawesome/free-regular-svg-icons/faThumbsUp';
  // https://fontawesome.com/icons/dice-three?f=classic&s=solid

  // {
  //   name: 'randomize',
  //   dropdownName: 'Randomize',
  //   category: 'recipe',
  //   tags: 'code',
  //   cursor: '/assets/cursors/dice.svg'
  // },
  
</script>

<div id="code-tools">

<Toolbar orientation="horizontal">
  <CodeEffectButton label="point"></CodeEffectButton>
  <CodeEffectButton label="random"></CodeEffectButton>
  <CodeEffectButton label="rainbow"></CodeEffectButton>
  <CodeEffectButton label="shuffle"></CodeEffectButton>
  <CodeEffectButton label="repeat"></CodeEffectButton>
  <CodeEffectButton label="redo"></CodeEffectButton>
  <CodeEffectButton label="erase"></CodeEffectButton>
  <CodeEffectButton label="sample"></CodeEffectButton>
  <CodeEffectButton label="connect"></CodeEffectButton>
  <!-- <CodeEffectButton label="point"><Icon data={mousePointer}/> </CodeEffectButton> -->
  <!-- <CodeEffectButton> <Icon data={indent}/> </CodeEffectButton>
  <CodeEffectButton><Icon data={eyedropper}/> </CodeEffectButton> -->
  <!-- <CodeEffectButton label="paint"><Icon data={paintBrush}/></CodeEffectButton> -->
  <!-- <CodeEffectButton><Icon data={eye}/></CodeEffectButton>
  <CodeEffectButton><Icon data={eyeSlash}/></CodeEffectButton> -->
  <!-- <CodeEffectButton label="shuffle"><Icon data={random}/></CodeEffectButton> -->
  <!-- <CodeEffectButton label="repeat"><Icon data={repeat}/></CodeEffectButton> -->
  <!-- <CodeEffectButton><Icon data={save}/></CodeEffectButton> -->
  <!-- <CodeEffectButton label="surprise"><Icon data={gift}/></CodeEffectButton> -->
  <!-- <CodeEffectButton><Icon data={trash}/></CodeEffectButton> -->
  <!-- <CodeEffectButton><Icon data={envelopeO}/></CodeEffectButton> -->
  <!-- <CodeEffectButton><Icon data={heart}/></CodeEffectButton>
  <CodeEffectButton><Icon data={thList}/></CodeEffectButton>
  <CodeEffectButton><Icon data={listAlt}/></CodeEffectButton>
  <CodeEffectButton><Icon data={lock}/></CodeEffectButton> -->

  <!-- import print from 'svelte-awesome/icons/print';
  <Icon data={print}/> -->

  <!-- <CodeEffectButton label="shuffle"/>
  <CodeEffectButton label="eyedropper"/>
  <CodeEffectButton label="repeat" />
  <CodeEffectButton label="save" />
  <CodeEffectButton label="delete" />
  <CodeEffectButton label="group" />
  <CodeEffectButton label="surprise" /> -->
</Toolbar>

<button class="code-instabutton">new tool</button>

</div>

<style>
  #code-tools {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .code-instabutton {
    max-width: 70px;
  }
</style>