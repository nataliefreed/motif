<script lang='ts'>
  import { togglePlay } from '../components/action-utils';
  import { isPlaying }  from '../stores/dataStore';
  
  export let firstPlay = false;

  function handleClick() {
    togglePlay();
  }

  const playIcon = `
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 384 512" style="vertical-align: middle; transform: translateY(-2px);">
      <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
    </svg>`;

    const pauseIcon = `
    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 320 512" style="vertical-align: middle; transform: translateY(-2px);">
      <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
    </svg>`;

</script>

<button class="instabutton" id="playPauseButton" on:click={handleClick}>
  {@html $isPlaying ? pauseIcon : playIcon}
</button>

<style>
  .instabutton {
    padding: 5px 10px;
    font-size: 1em;
    font-family: 'FuturaHandwritten';
    cursor: pointer;
    border: none;
    border-radius: 5px;
    color: black;
  }

  .button-icon {
    vertical-align: middle;
    transform: translateY(2px);
}
</style>