class Abulafia {
  private data: Map<string, string[]> = new Map();
  private used: Map<string, string[]> = new Map();

  private nonEmptyRegex = /\S/;
  private entryRegex = /^\d+,/;
  private referenceRegex = /\[(\w|:)*\]/;
  private auditRegex = /\[(\w|:)*\]/g;

  // private resetUsed(): void {
  //   this.used = new Map();
  // }

  private randIntInRange(min: number, max: number): number {
    // Stryker disable next-line ArithmeticOperator
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private choose(list: string[]): string {
    return list[this.randIntInRange(0, list.length-1)];
  }

  private lookup(key: string): string[] {
    const list: string[] | undefined = this.data.get(key);
    if (!list) {
      throw new Error(`Abulafia Error: No table for key "${key}"`);
    }
    return list;
  }

  private replacer(match: string): string {
    const key: string = match.substring(1,match.length-1);
    // const parts = key.split(':');
    // if (parts.length > 1) {
    //   switch (parts[0]) { //xc vs xcFirst
    //       case 'uc': return this.choose(this.lookup(parts[1])).toUpperCase();
    //       case 'lc': return this.choose(this.lookup(parts[1])).toLowerCase();
    //       case 'tc': return toTitleCase(this.choose(this.lookup(parts[1])));
    //       case 'two': return this.choose2(this.lookup(parts[1]), parts[2]);
    //       case 'uniq': return this.chooseUnique(parts[1]);
    //       //case 'reverse'
    //       //case rot13
    //       default:
    //         throw new Error(`Abulafia Error: unknown function '${parts[0]}'`);
    //   }
    // }
    return this.choose(this.lookup(key));
  }

  private process(item: string): string {
    const matches = item.match(this.referenceRegex);
    if (matches && matches[0]) {
      return this.process(item.replace(this.referenceRegex, this.replacer(matches[0])));
    } else {
      return item;
    }
  }

  public hasTable(tableName: string) { /* check whether table of that name is loaded */
    // Stryker disable next-line LogicalOperator
    return this.data.has(tableName) && this.data.get(tableName);
  }

  public get(key: string) {
    // this.resetUsed();
    return this.process(this.choose(this.lookup(key)));
  }

  public getList(key: string): string[] {
    const list: string[] | undefined = this.data.get(key);
    if (!list) {
      throw new Error(`Abulafia Error: No table for key "${key}"`);
    }
    return list;
  }

  public getTableNames() {
    return [...this.data.keys()];
  }
  
  public load(fileContents: string) {
    const tables: string[] = fileContents.split(';');       /* split on ';' to separate into individual tables */
    for (const table of tables) {                           /* iterate over tables */
      if (this.nonEmptyRegex.test(table)) {                 /* skip any tables/line that consist only of whitespace */
        const lines = table.split('\n');                    /* split table into lines */
        const tableName = lines[0].trim();                  /* ';' was removed by first split, so first line is the table name */
        const entries: string[] = lines.slice(1);           /* slice off the table name line */
        const list = [];
        for (const entry of entries) {                    /* iterate over remaining lines */
          if (this.entryRegex.test(entry)) {              /* make sure we don't have a bad line */
            const weight = parseInt(entry);               /* entry must begin with a number, which parseInt will handle */
            const text = entry.substring(entry.indexOf(',')+1); /* split off everything up to the first comma, take the remainder */
            for (let i = 0; i < weight; i++) {            /* add the line weight times */
              list.push(text);                            /* put the lines into the list */
            }
          } else {
            if (this.nonEmptyRegex.test(entry)) {         /* warn about any non-empty lines that we failed to parse */
              console.warn(`Abulafia Warning: could not parse line "${entry}"`)
            }
          }
        }
        if (list.length > 0) {
          this.data.set(tableName, list);                   /* add the table to our data set, overwriting if needed */
        } else {                                            /* warn if we skipped a table because it has no entries */
          console.warn(`Abulafia Warning: table "${tableName}" has no entries and was skipped`);
        }
      }
    }
  }

  public auditForMissingTables(): string[] {
    const out: string[] = [];
    this.data.forEach((value) => {
      value.forEach((str) => {
        str.match(this.auditRegex)?.forEach((match) => {
          if(!this.hasTable(match.substring(1,match.length-1))) {
            out.push(match.substring(1,match.length-1));
          }
        })
      })
    });
    return out;
  }

}

export default Abulafia;
