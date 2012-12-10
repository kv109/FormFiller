bundled_script=../bundles/bundled_formfiller.js
bundled_background_script=../bundles/bundled_background.js

echo "Main script: $bundled_script"
echo "Background script: $bundled_background_script"

echo "// This file is generated with bundle_scripts.sh //" > $bundled_script
echo "// --------------------------------------------- //" >> $bundled_script
echo "" >> $bundled_script
echo "" >> $bundled_script

for file in tea.js functions.js autologger.js
do
	echo "Adding $file to $bundled_script"
	echo "//-------------------$file-----------------//" >> $bundled_script
	cat ../$file >> $bundled_script
	echo "//-------------------$file-(end)-----------//" >> $bundled_script
done

for file in constants.js functions.js background.js
do
	echo "Adding $file to $bundled_background_script"
	echo "//-------------------$file-----------------//" >> $bundled_background_script
	cat ../$file >> $bundled_background_script
	echo "//-------------------$file-(end)-----------//" >> $bundled_background_script
done
