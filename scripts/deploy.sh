cd ../..
rm -rf Form-Filler-Deploy
cp -r Form-Filler Form-Filler-Deploy
cd Form-Filler-Deploy
rm -rf .git
rm .gitignore
rm -rf nbproject
rm -rf tests
cd bundles
rm *.js
cd ..
cd scripts
./bundle_scripts.sh
cd ../..
tar -czf formfiller.zip Form-Filler-Deploy/
