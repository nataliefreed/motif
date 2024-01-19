<script lang="ts">
  
</script>

<!-- <div class="page"> -->
  <div class="container">
    <div class="lined-paper">
      <ul>
        <slot></slot>
      </ul>
    </div>
  </div>
<!-- </div> -->


<style>

  .container {
      display: flex;
      width: 100%;
      height: 85%;
      margin-top: 3em;
      /* margin-left: 4em; */
      /* flex: 1 0 auto; */
  }

  .lined-paper {
      width: 100%;
      height: 100%;
      margin-top: 5px;
      overflow-y: auto;
      overflow-x: hidden;
        background-image: repeating-linear-gradient(
        to bottom, 
        transparent, 
        transparent calc(2em + 2px), 
        #add8e6 calc(2em + 2px), 
        #add8e6 calc(2em + 3px));
      line-height: calc(2em - 0.3px);
      scroll-snap-type: y mandatory;
      position: relative;
      flex-shrink: 0;
  }

  .lined-paper ul {
      list-style: none;
      margin: 3px 0 0 5em;
      margin: 0;
      padding: 0;
      scroll-snap-align: start;
      height: 90%;
      overflow: auto;
      padding-bottom: 3em;
      position: relative;
      left: calc(var(--adjusted-page-width)*0.1);
      top: 4px;
  }

  /* red vertical margins */
  .container::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--adjusted-page-width)*0.1); /* Margin from left edge */
    width: 0.1em; /* Line weight */
    background-color: #ffbed1; /* Light red color */
    /* z-index: -1; */
  }

</style>



<!-- /* vertical red page margin */
  .right-page::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--adjusted-page-width)*0.1); /* Margin from left edge */
    width: 0.1em; /* Line weight */
    background-color: #ffbed1; /* Light red color */
    z-index: -1;
  }

  /* horizontal blue lines on lined paper */
  .right-page::after {
    content: "";
    position: absolute;
    top: calc(var(--lined-paper-line-height)*2); /* Margin from top edge */
    bottom: calc(var(--lined-paper-line-height)*2);   /* Space at the bottom */
    left: 0;        /* Starts at the left edge */
    right: 0;       /* Ends at the right edge */
    background-image: repeating-linear-gradient(
        to bottom, 
        transparent 0%, /*transparent from 0 to x% */
        transparent var(--lined-paper-line-height-blank), 
        #add8e6 var(--lined-paper-line-height-blank), /*blue from x% to (x+1)% */
        #add8e6 var(--lined-paper-line-height) /*blue from (x+1)% to 100% */
    );
    z-index: -1; /* Place it below the content */
  } -->
