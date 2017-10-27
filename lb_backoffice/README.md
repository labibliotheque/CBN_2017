
# About the GITHUB workflow :

  * 1 - login is called to ensure credential OK
  * 2 - current DB is loaded to get the SHA
  * 3 - main JSON is patched with new data (first commit)
  * 4 - imported CSV is backup (second commit)
  * 5 - build status is called several times until status is built.

note : if the first commit succeed but not the second one then first commit has to be revert manually before retry.


# Development

To test github access during development, run the simulator from root repository directory : 

  $ ruby -I . local.rb

note it require some gems (sinatra)

# Test case

* login
  
  * bad credentials : KO
  * good credentials : OK

* import data

  * from empty database (db.json should contains a valid empty json array : [])

    * any month/year : OK

  * from existing database

    * bad CSV format : KO

    * bad encoding (ISO-8859-1) : OK (any encoding should be supported and correctly converted)

    * existing month/year : KO
    * not consecutive month/year : KO

    * missing/not expected locations and/or categories : OK


# Tips

Convert a UTF-8 encoded file to ISO latin for testing purposes :

    $ iconv -f UTF-8 -t ISO-8859-1 CBN_pretsjour_bibempl_1704.csv -o CBN_pretsjour_bibempl_1704-iso.csv