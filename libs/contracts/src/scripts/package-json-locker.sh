# Calculate the SHA checksum
sha=$(shasum package.json pnpm-lock.yaml | shasum | sed 's/ .*//')

if [ $sha == "790e2a566312e737032426e33ef2ec8f86ebac2e" ]
then
	exit 0
fi
echo "Please don't change package.json or pnpm-lock.yaml"
exit 1
