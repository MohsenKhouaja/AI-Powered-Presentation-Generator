for (var i = 0; i < 100; i++) {
  const log = () => {
    console.log(i);
  };
   setTimeout(() => {
    log()
  }, 100);
}
