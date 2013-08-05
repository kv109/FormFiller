version=$1
echo "Version $version will be created."
cd ../..
rm -rf FormFillerDeploy
cp -r FormFiller FormFillerDeploy
cd FormFillerDeploy
sed -i -e's/"version.*[0-9\.]"/"version": "'$version'"/' manifest.json	#version
sed -i -e's/[^:]\/\/.*/remove_me/' manifest.json	#remove comments
sed -i -e's/"key.*/remove_me/' manifest.json		#remove line with "key"
sed -i -e'/remove_me/d' manifest.json
rm -rf .git
rm .gitignore
rm -rf nbproject
rm -rf tests
cd bundles
rm *.js
cd ..
cd scripts
./bundle_scripts.sh
