# Calculate the SHA checksum
sha=$(shasum package.json pnpm-lock.yaml | shasum | sed 's/ .*//')

if [ $sha == "224b02b35475100442a843c6dafb8ff763ef376c" ]
then
	exit 0
fi
echo "Please don't change package.json or pnpm-lock.yaml"
exit 1
