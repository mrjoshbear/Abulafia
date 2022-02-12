import Abulafia from "./abulafia";
import * as fs from 'fs';
import * as path from 'path';

describe('Tests for abulafia.js', () => {

  it('throws errors and returns empty values when first initialized', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const key = 'key';
    const abulafia = new Abulafia();
    // act & assert
    const actualKeys = abulafia.getTableNames();
    const actualAudit = abulafia.auditForMissingTables();
    expect(actualKeys).toEqual([]);
    expect(actualAudit).toEqual([]);
    expect(() => {
      abulafia.get(key);
    }).toThrow(`Abulafia Error: No table for key "${key}"`);
    expect(() => {
      abulafia.getList(key);
    }).toThrow(`Abulafia Error: No table for key "${key}"`);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('throws an error when loading a value that is not a string', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const abulafia = new Abulafia();
    // act & assert
    expect(() => {
      abulafia.load(1 as unknown as string);
    }).toThrow(expect.any(Error));
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads an empty table and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual([]);
    expect(actualHasTable).toBeFalsy();
    expect(() => {
      abulafia.get("key");
    }).toThrow(`Abulafia Error: No table for key "key"`);
    expect(() => {
      abulafia.getList("key");
    }).toThrow(`Abulafia Error: No table for key "key"`);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith('Abulafia Warning: table "key" has no entries and was skipped')
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(0);  
  });

  it('loads a table with only 0 weighted entries and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n0,comment";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual([]);
    expect(actualHasTable).toBeFalsy();
    expect(() => {
      abulafia.get("key");
    }).toThrow(`Abulafia Error: No table for key "key"`);
    expect(() => {
      abulafia.getList("key");
    }).toThrow(`Abulafia Error: No table for key "key"`);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith('Abulafia Warning: table "key" has no entries and was skipped')
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a minimal table and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n1,value";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualValue = abulafia.get("key");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualValue).toEqual("value");
    expect(actualList).toEqual(["value"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a minimal table twice and logs a warning and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n1,value";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualValue = abulafia.get("key");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualValue).toEqual("value");
    expect(actualList).toEqual(["value"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith('Abulafia Warning: overwrote entries for table "key"')
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a minimal table with a 10+ entry and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n10,value";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualValue = abulafia.get("key");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualValue).toEqual("value");
    expect(actualList.length).toEqual(10);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a minimal table with a bad entries and logs a warning and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n1,value\nbad\n 1,bad";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualValue = abulafia.get("key");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualValue).toEqual("value");
    expect(actualList).toEqual(["value"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith('Abulafia Warning: could not parse line "bad"')
    expect(console.warn).toHaveBeenCalledWith('Abulafia Warning: could not parse line " 1,bad"')
    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a minimal table with a comma in the text and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n1,value,value";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualValue = abulafia.get("key");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"])
    expect(actualHasTable).toBeTruthy();
    expect(actualValue).toEqual("value,value");
    expect(actualList).toEqual(["value,value"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a table with multiple values and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n1,foo\n2,bar";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualValue = abulafia.get("key");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"]);
    expect(actualHasTable).toBeTruthy();
    expect("foobar").toContain(actualValue);
    expect(actualList).toEqual(["foo","bar","bar"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads multiple tables and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key1\n1,foo\n\n;key2\n1,bar";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable1 = abulafia.hasTable("key1");
    const actualHasTable2 = abulafia.hasTable("key2");
    const actualValue1 = abulafia.get("key1");
    const actualList1 = abulafia.getList("key1");
    const actualValue2 = abulafia.get("key2");
    const actualList2 = abulafia.getList("key2");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key1","key2"]);
    expect(actualHasTable1).toBeTruthy();
    expect(actualHasTable2).toBeTruthy();
    expect(actualValue1).toEqual("foo");
    expect(actualValue2).toEqual("bar");
    expect(actualList1).toEqual(["foo"]);
    expect(actualList2).toEqual(["bar"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads multiple tables with references and returns correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key1\n2,[key2]\n\n;key2\n1,[key3]\n\n;key3\n3,foo";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable1 = abulafia.hasTable("key1");
    const actualHasTable2 = abulafia.hasTable("key2");
    const actualHasTable3 = abulafia.hasTable("key3");
    const actualValue1 = abulafia.get("key1");
    const actualList1 = abulafia.getList("key1");
    const actualValue2 = abulafia.get("key2");
    const actualList2 = abulafia.getList("key2");
    const actualValue3 = abulafia.get("key3");
    const actualList3 = abulafia.getList("key3");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key1","key2","key3"]);
    expect(actualHasTable1).toBeTruthy();
    expect(actualHasTable2).toBeTruthy();
    expect(actualHasTable3).toBeTruthy();
    expect(actualValue1).toEqual("foo");
    expect(actualValue2).toEqual("foo");
    expect(actualValue3).toEqual("foo");
    expect(actualList1).toEqual(["[key2]","[key2]"]);
    expect(actualList2).toEqual(["[key3]"]);
    expect(actualList3).toEqual(["foo","foo","foo"]);
    expect(actualAudit).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('detects missing references', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const file = ";key\n1,[value]";
    const abulafia = new Abulafia();
    // act
    abulafia.load(file);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("key");
    const actualHasReferencedTable = abulafia.hasTable("value");
    const actualList = abulafia.getList("key");
    const actualAudit = abulafia.auditForMissingTables();
    // assert
    expect(actualTableNames).toEqual(["key"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualHasReferencedTable).toBeFalsy();
    expect(() => {
      abulafia.get("key");
    }).toThrow(`Abulafia Error: No table for key "value"`);
    expect(actualList).toEqual(["[value]"]);
    expect(actualAudit).toEqual(["value"]);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a file and processes it and produces correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const fileContent = fs.readFileSync("./test-tables/single-table.txt", {encoding:'utf8', flag:'r'});
    const abulafia = new Abulafia();
    // act
    abulafia.load(fileContent);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("PreservationSubstance");
    const actualList = abulafia.getList("PreservationSubstance");
    const actualAudit = abulafia.auditForMissingTables();
    const actualValue = abulafia.get("PreservationSubstance");
    // assert
    expect(fileContent).toBeDefined();
    expect(actualTableNames).toEqual(["PreservationSubstance"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualList.length).toEqual(25);
    expect(actualList).not.toContain("comment");
    expect(actualAudit).toEqual([]);
    expect(actualValue).toBeDefined();
    expect(actualValue).not.toContain("comment");
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a file with multiple tables and produces correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const fileContent = fs.readFileSync("./test-tables/multiple-tables.txt", {encoding:'utf8', flag:'r'});
    const abulafia = new Abulafia();
    // act
    abulafia.load(fileContent);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("main");
    const actualList = abulafia.getList("main");
    const actualAudit = abulafia.auditForMissingTables();
    const actualValue = abulafia.get("main");
    // assert
    expect(fileContent).toBeDefined();
    expect(actualTableNames).toEqual(["main", "malefirst", "femalefirst", "surname"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualList.length).toEqual(2);
    expect(actualList).not.toContain("comment");
    expect(actualAudit).toEqual([]);
    expect(actualValue).toBeDefined();
    expect(actualValue).not.toContain("comment");
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads a file with recursive tables and produces correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const fileContent = fs.readFileSync("./test-tables/recursive-table.txt", {encoding:'utf8', flag:'r'});
    const abulafia = new Abulafia();
    // act
    abulafia.load(fileContent);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable = abulafia.hasTable("vampireName");
    const actualList = abulafia.getList("vampireName");
    const actualAudit = abulafia.auditForMissingTables();
    const actualValue = abulafia.get("vampireName");
    // assert
    expect(fileContent).toBeDefined();
    expect(actualTableNames).toEqual(["vampireName", "vampireTitle", "vampireNamePart"]);
    expect(actualHasTable).toBeTruthy();
    expect(actualList.length).toEqual(1);
    expect(actualList).not.toContain("comment");
    expect(actualAudit).toEqual([]);
    expect(actualValue).toBeDefined();
    expect(actualValue).not.toContain("comment");
    expect(actualValue).toContain("Count");
    expect(actualValue).toContain("Raven");
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('loads two files with cross-file references and produces correct output', () => {
    // arrange
    console.warn = jest.fn();
    console.error = jest.fn();
    const fileContent1 = fs.readFileSync("./test-tables/cross-file-tables1.txt", {encoding:'utf8', flag:'r'});
    const fileContent2 = fs.readFileSync("./test-tables/cross-file-tables2.txt", {encoding:'utf8', flag:'r'});
    const abulafia = new Abulafia();
    // act
    abulafia.load(fileContent1);
    abulafia.load(fileContent2);
    const actualTableNames = abulafia.getTableNames();
    const actualHasTable1 = abulafia.hasTable("main");
    const actualHasTable2 = abulafia.hasTable("notMain");
    const actualHasTable3 = abulafia.hasTable("foobar");
    const actualHasTable4 = abulafia.hasTable("baz");

    const actualList = abulafia.getList("main");
    const actualAudit = abulafia.auditForMissingTables();
    const actualValue1 = abulafia.get("main");
    const actualValue2 = abulafia.get("notMain");
    // assert
    expect(fileContent1).toBeDefined();
    expect(fileContent2).toBeDefined();
    expect(actualTableNames).toEqual(["main", "baz", "foobar", "notMain"]);
    expect(actualHasTable1).toBeTruthy();
    expect(actualHasTable2).toBeTruthy();
    expect(actualHasTable3).toBeTruthy();
    expect(actualHasTable4).toBeTruthy();
    expect(actualList.length).toEqual(1);
    expect(actualList).not.toContain("comment");
    expect(actualAudit).toEqual([]);
    expect(actualValue1).toBeDefined();
    expect("foobar").toContain(actualValue1)
    expect(actualValue1).not.toContain("comment");
    expect(actualValue2).toBeDefined();
    expect(actualValue2).toEqual("baz");
    expect(actualValue2).not.toContain("comment");
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

});
