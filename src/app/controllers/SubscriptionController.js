import { isBefore } from 'date-fns';
import Subscription from '../models/SubscriptionMeetup';
import User from '../models/User';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'You have sign meetups from other user ' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: "You don't have sign old meetups" });
    }

    const data_available = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (data_available) {
      return res.status(400).json({ error: 'You already sign this meetup' });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();