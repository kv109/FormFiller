version=$1
echo "Version $version will be created."
cd ../..
rm -rf Form-Filler-Deploy
cp -r Form-Filler Form-Filler-Deploy
cd Form-Filler-Deploy
sed -i -e's/"version.*[0-9\.]"/"version": "'$version'"/' manifest.json		#version
sed -i -e's/[^:]\/\/.*//' manifest.json		#remove comments
rm -rf .git
rm .gitignore
rm -rf nbproject
rm -rf tests
cd bundles
rm *.js
cd ..
cd scripts
./bundle_scripts.sh
