settings=$settingsfolder/$expname-settings.js
template=$settingsfolder/$expname-template.js #txt

paramfile=params4.txt
nsim=5
EXPNAME=order2d

# ---------------------------------------------------------------------
# CODE:
# ---------------------------------------------------------------------

np=$( cat $paramfile | wc -l )

echo ".DELETE_ON_ERROR :"
echo "all : "
# Loop over the simulations and parameter combis

for p in $(seq 1 $np) ; do

	LFORCED=$( cat $paramfile | awk -v line=$p 'NR==line{print $1}')
	LRAND=$( cat $paramfile | awk -v line=$p 'NR==line{print $2}')
	DENSITY=$( cat $paramfile | awk -v line=$p 'NR==line{print $3}')
		
	NAME=$EXPNAME-lforced$LFORCED-lrand$LRAND-density$DENSITY

	# Now the recipes for the individual simulation tracks
	for sim in $(seq 1 $nsim) ; do

		# Ensure the loop can be easily stopped
		trap "exit 1" SIGINT SIGTERM

		# trackfiles
		FILE=../../data/order_20190222/$EXPNAME/$NAME-sim$sim.txt
		echo "$FILE : ../../2d.js"
		echo -e "\t@"node \$\< $LFORCED $LRAND 200 $DENSITY 100 5000 0 0 "> \$@"
		echo "all : "$FILE
	done
done
