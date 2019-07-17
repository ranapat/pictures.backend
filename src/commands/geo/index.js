import fs from 'fs';
import path from 'path';
import im from 'imagemagick';
import NodeGeocoder from 'node-geocoder';

import { tf } from 'tasksf';
import { icons, escapes } from 'clicomp';
import { Renderer, Label, Progress } from 'clicomp';

let renderer;
let workInProgress;
let label;
let progress;

const toDegrees = raw => {
  if (!raw) {
    return;
  }

  const result = [];
  const lat = raw.trim().split(',');
  for (const latPart of lat) {
    const sections = latPart.trim().split('/');
    result.push(sections[0], sections[1]);
  }
  return result[0] / result[1] + (result[2] / result[3]) / 60 + (result[4] / result[5]) / 3600;
};

const clearScreen = () => {
  renderer = Renderer.instance;

  renderer.clearScreen();

  workInProgress = new Label(0, 0, 'Working...', icons.earth, {
    maxWidth: 60,
    interval: 250,
    labelForegroundColor: escapes.colors.Foreground.Yellow
  });
  workInProgress.show();

  label = new Label(0, 2, 'Getting pictures to Reverse Geo Code...', undefined, {
    maxWidth: 60,
    interval: 250,
    labelForegroundColor: escapes.colors.Foreground.Green,
    iconForegroundColor: escapes.colors.Foreground.Red
  });
  label.show();

  progress = new Progress(0, 4, 60, 0, '', {});
  progress.show();

  renderer.cursorHide();
};

const updateLabel = (value) => {
  label.label = value;
};

const updateProgress = (value) => {
  progress.percentages = value;
};

const disposeRenderer = () => {
  workInProgress.label = 'All done.';

  label = new Label(0, 6, 'Scanning complete.', undefined, {
    maxWidth: 60,
    interval: 250,
    labelForegroundColor: escapes.colors.Foreground.Green,
    iconForegroundColor: escapes.colors.Foreground.Red
  });
  label.show();

  renderer.cursorTo(0, 8);

  renderer.cursorShow();
};

const init = (config, command, args, database, complete) => {
  const quiet = command.quiet === true;

  let limit;
  let file;

  if (args.length > 0) {
    const first = args[0];
    if (fs.existsSync(first) && fs.lstatSync(first).isFile()) {
      file = path.resolve(first);
    } else if (!isNaN(first)) {
      limit = parseInt(first);
    }
  }

  if (!quiet) {
    clearScreen();
  }

  let toGeo;

  if (file) {
    toGeo = database.execute(
      'getByFullPath',
      file
    );
  } else {
    toGeo = database.execute(
      'toGeo',
      limit
    );
  }

  toGeo._complete = (self) => {
    const pictures = self.get('result');

    const sequence = tf.sequence(() => {
      if (!quiet) {
        disposeRenderer();
      }

      complete();
    });

    let i = 0;

    if (!quiet) {
      updateLabel(`Reverse Geo Code picture 0 out of ${pictures.length}`);
    }

    for (const picture of pictures) {
      sequence.push(tf.task((complete, self) => {
        im.readMetadata(picture.path + picture.name, (error, metadata) => {
          if (
            !error
              && metadata && metadata.exif && metadata.exif.gpsLatitude && metadata.exif.gpsLongitude
          ) {
            const geocoder = NodeGeocoder(config.nodeGeocoder);
            const coordinates = {
              lat: toDegrees(metadata.exif.gpsLatitude),
              lon: toDegrees(metadata.exif.gpsLongitude)
            };

            geocoder.reverse(coordinates, (error, data) => {
              if (!error) {
                const task = database.execute(
                  'geo',
                  picture.id, data
                );
                task._complete = () => {
                  if (!quiet) {
                    updateProgress(++i / pictures.length);
                    updateLabel(`Reverse Geo Code picture ${i} out of ${pictures.length}`);
                  }
                };
                sequence.unshift(task);
              }

              complete();
            });
          } else {
            complete();
          }
        });
      }, 0));
    }

    sequence.run();
  };

  toGeo.run();
};

export { init };
